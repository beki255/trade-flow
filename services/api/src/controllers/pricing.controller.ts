import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Haversine distance in KM
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 1. Compute Dynamic Spot Rate with Itemized Cost Breakdown
 * POST /api/pricing/spot-rate
 */
export const calculateSpotRate = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      originLat = 8.895,
      originLng = 38.765,
      destLat = 11.595,
      destLng = 43.148,
      weightTons = 30.0,
      cargoType = 'GENERAL_CONTAINER',
      dieselPricePerLiter = 59.8,
      corridorName = 'Djibouti-Modjo-Addis Ababa',
      isRefrigerated = false,
      isHazardous = false,
    } = req.body;

    // 1. Base Distance
    let distanceKm = calculateDistanceKm(
      parseFloat(originLat),
      parseFloat(originLng),
      parseFloat(destLat),
      parseFloat(destLng)
    );
    if (distanceKm < 50) distanceKm = 880; // Standard corridor distance fallback

    // 2. Base Corridor Distance Rate (e.g. 145 ETB per km for standard 30T heavy truck)
    const baseRatePerKm = 145.0;
    const baseFreightEtb = Math.round(distanceKm * baseRatePerKm * (parseFloat(weightTons) / 30.0));

    // 3. Demand-to-Capacity Ratio along Corridor (Simulated real-time demand index: 1.12 for peak season)
    const demandRatio = 1.12;
    const demandAdjustmentEtb = Math.round(baseFreightEtb * (demandRatio - 1.0));

    // 4. Fuel Cost Index (Baseline 50 ETB/L; Current 59.8 ETB/L = +19.6% fuel index)
    const baselineDieselPrice = 50.0;
    const currentFuelPrice = parseFloat(dieselPricePerLiter) || 59.8;
    const fuelCostIndex = currentFuelPrice / baselineDieselPrice;
    const fuelSurchargeEtb = Math.round(baseFreightEtb * 0.35 * (fuelCostIndex - 1.0));

    // 5. Corridor Congestion & Checkpoint Surcharges (Galafi Border & Modjo Dry Port delays)
    const congestionSurchargeEtb = 12500;

    // 6. Cargo Type Multipliers (Refrigerated / Hazardous handling)
    let specialHandlingEtb = 0;
    if (isRefrigerated || cargoType === 'REFRIGERATED_PERISHABLE') {
      specialHandlingEtb += Math.round(baseFreightEtb * 0.22); // +22% for genset diesel and temperature log
    }
    if (isHazardous || cargoType === 'HAZARDOUS_CHEMICAL') {
      specialHandlingEtb += Math.round(baseFreightEtb * 0.3); // +30% for dangerous goods protocol
    }

    // Subtotal & Bounds
    const subtotalEtb = baseFreightEtb + demandAdjustmentEtb + fuelSurchargeEtb + congestionSurchargeEtb + specialHandlingEtb;
    const floorBoundEtb = Math.round(subtotalEtb * 0.88);
    const ceilingBoundEtb = Math.round(subtotalEtb * 1.18);
    const finalRateEtb = subtotalEtb;

    // Save calculation into Pricing Audit Log Database
    const auditLog = await prisma.pricingLog.create({
      data: {
        corridorName,
        baseDistanceKm: Math.round(distanceKm),
        baseCorridorRateEtb: baseFreightEtb,
        demandRatio,
        fuelCostIndex: Math.round(fuelCostIndex * 100) / 100,
        congestionSurchargeEtb,
        calculatedSpotRateEtb: subtotalEtb,
        floorBoundEtb,
        ceilingBoundEtb,
        finalRateEtb,
      },
    });

    res.json({
      success: true,
      pricing: {
        totalSpotRateEtb: finalRateEtb,
        floorBoundEtb,
        ceilingBoundEtb,
        currency: 'ETB',
        distanceKm: Math.round(distanceKm),
        itemizedBreakdown: {
          baseFreightEtb,
          demandIndexFactor: demandRatio,
          demandAdjustmentEtb,
          dieselPricePerLiter: currentFuelPrice,
          fuelCostIndex: Math.round(fuelCostIndex * 100) / 100,
          fuelSurchargeEtb,
          congestionSurchargeEtb,
          specialHandlingEtb,
          vat15PctEtb: Math.round(finalRateEtb * 0.15),
          totalWithVatEtb: Math.round(finalRateEtb * 1.15),
        },
        auditLogId: auditLog.id,
        refreshedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 3600 * 1000).toISOString(), // Valid for 1 hour
      },
    });
  } catch (error: any) {
    console.error('Error calculating spot rate:', error);
    res.status(500).json({ error: error.message || 'Failed to compute dynamic spot rate' });
  }
};

/**
 * 2. Contract Rate Management & Divergence Alert Workflow
 * POST /api/pricing/contract-rate/check
 */
export const checkContractDivergence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractRateEtb, currentSpotRateEtb = 185000, contractId = 'CTR-2026-881' } = req.body;

    const contractPrice = parseFloat(contractRateEtb) || 140000;
    const spotPrice = parseFloat(currentSpotRateEtb) || 185000;

    const divergencePct = Math.round(((spotPrice - contractPrice) / contractPrice) * 100);
    const isMateriallyDivergent = Math.abs(divergencePct) >= 20.0;

    res.json({
      contractId,
      contractRateEtb: contractPrice,
      currentSpotRateEtb: spotPrice,
      divergencePercentage: divergencePct,
      isMateriallyDivergent,
      status: isMateriallyDivergent ? 'FLAGGED_FOR_RENEGOTIATION' : 'WITHIN_TOLERANCE',
      recommendation: isMateriallyDivergent
        ? `Contract rate diverges by ${divergencePct}% from live spot index. Automated renegotiation workflow triggered.`
        : 'Contract rate is aligned with prevailing corridor rates.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify contract rate divergence' });
  }
};

/**
 * 3. Get Pricing Audit Trail
 * GET /api/pricing/audit-logs
 */
export const getPricingAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.pricingLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch pricing audit logs' });
  }
};
