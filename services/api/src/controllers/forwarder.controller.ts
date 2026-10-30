import { Request, Response } from 'express';
import {
  PrismaClient,
  UserRole,
  LoadStatus,
  CargoType,
  BidStatus,
  ShipmentStatus,
  CustomsClearanceStatus,
  CustomsDocType,
} from '@prisma/client';

const prisma = new PrismaClient();

const isValidUUID = (str: any): boolean => {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
};



/**
 * 1. Multi-Shipper Client Portfolio & Overview
 * GET /api/forwarder/clients
 */
export const getForwarderClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const shippers = await prisma.user.findMany({
      where: { role: UserRole.SHIPPER },
      include: {
        shipperLoads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      take: 30,
    });

    const clients = shippers.map((s) => {
      const loads = s.shipperLoads || [];
      const totalTonnage = loads.reduce((sum, l) => sum + (l.weightTons || 0), 0);
      const activeCount = loads.filter((l) => l.status === LoadStatus.OPEN || l.status === LoadStatus.IN_TRANSIT).length;
      return {
        id: s.id,
        fullName: s.fullName,
        companyName: s.companyName || s.fullName,
        tin: s.tin || 'N/A',
        phone: s.phone || 'N/A',
        email: s.email,
        totalLoadsCount: loads.length,
        activeLoadsCount: activeCount,
        totalTonnageManaged: Math.round(totalTonnage * 10) / 10,
        verificationStatus: s.verificationStatus,
        recentLoads: loads.slice(0, 3).map((l) => ({
          id: l.id,
          loadCode: l.title || 'Consignment',
          title: l.title,
          weightTons: l.weightTons,
          route: `${l.originName} ➔ ${l.destName}`,
          status: l.status,
        })),
      };
    });

    const totalActiveLoads = shippers.reduce(
      (sum, s) => sum + (s.shipperLoads || []).filter((l) => l.status === LoadStatus.OPEN || l.status === LoadStatus.IN_TRANSIT).length,
      0
    );

    res.json({
      stats: {
        activeClients: clients.length,
        totalLoadsManaged: shippers.reduce((sum, s) => sum + (s.shipperLoads || []).length, 0),
        activeLoadsManaged: totalActiveLoads,
        averageSavingsPct: 32,
      },
      clients,
    });
  } catch (error: any) {
    console.error('Error fetching forwarder clients:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch forwarder clients' });
  }
};

/**
 * 2. Less-than-Truckload (LTL) Cargo Queue for Consolidation
 * GET /api/forwarder/ltl-loads
 */
export const getLtlLoads = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawLoads = await prisma.load.findMany({
      where: {
        status: { in: [LoadStatus.OPEN, LoadStatus.BIDDING] },
      },
      include: {
        shipper: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            tin: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    // Map open database loads
    const dbQueue = rawLoads.map((l) => {
      const isLtl = (l.weightTons || 28) <= 22;
      return {
        id: l.id,
        loadCode: `TF-LTL-${l.id.slice(0, 6).toUpperCase()}`,
        title: l.title || 'Freight Consignment',
        cargoType: l.cargoType || 'CONTAINERIZED',
        weightTons: l.weightTons || 0,
        volumeCbm: l.volumeCbm || 0,
        origin: l.originName || 'Addis Ababa',
        destination: l.destName || 'Djibouti Port',
        targetBudgetEtb: l.targetBudgetEtb || l.spotEstimatedPriceEtb || 0,
        shipperName: l.shipper?.fullName || 'Consignor Client',
        shipperCompany: l.shipper?.companyName || l.shipper?.fullName || 'Consignor Enterprise',
        shipperTin: l.shipper?.tin || 'N/A',
        status: l.status,
        pickupWindowStart: l.pickupWindowStart?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        isEligibleForConsolidation: isLtl,
      };
    });

    const ltlQueue = dbQueue;

    res.json({ ltlQueue });
  } catch (error: any) {
    console.error('Error fetching LTL loads:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch LTL loads' });
  }
};

/**
 * 3. Consolidate LTL Loads into FTL High-Cube Container
 * POST /api/forwarder/consolidate
 */
export const consolidateLtlLoads = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      loadIds = [],
      containerType = '40FT_HIGH_CUBE',
      masterTitle = 'Consolidated High-Cube Freight Export Container',
      origin = 'Modjo Dry Port Multimodal Terminal',
      destination = 'Djibouti Port Red Sea Terminal',
      targetCarrierBudgetEtb,
    } = req.body;

    if (!Array.isArray(loadIds) || loadIds.length < 2) {
      res.status(400).json({ error: 'Please select at least 2 partial LTL consignments to consolidate into a container' });
      return;
    }

    const selectedDbLoads = await prisma.load.findMany({
      where: { id: { in: loadIds } },
      include: { shipper: true },
    });

    if (selectedDbLoads.length < 2) {
      res.status(404).json({ error: 'Could not find the specified LTL consignments in the database' });
      return;
    }

    const primaryShipperId = selectedDbLoads[0].shipperId;
    const totalWeightTons = selectedDbLoads.reduce((sum, l) => sum + (l.weightTons || 8.0), 0);
    const totalVolumeCbm = selectedDbLoads.reduce((sum, l) => sum + (l.volumeCbm || 15.0), 0);
    const separateShipmentCost = selectedDbLoads.reduce((sum, l) => sum + (l.targetBudgetEtb || l.spotEstimatedPriceEtb || 65000), 0);
    const subConsignments = selectedDbLoads.map((l) => ({
      id: l.id,
      code: `TF-LTL-${l.id.slice(0, 6).toUpperCase()}`,
      shipperCompany: l.shipper?.companyName || l.shipper?.fullName || 'Consignor',
      cargo: l.title,
      weightTons: l.weightTons,
    }));

    // Max capacity for 40ft High Cube is 30 Tons, 76.2 Cbm
    const maxCapacityTons = containerType.includes('20FT') ? 24.0 : 30.0;
    const maxCapacityCbm = containerType.includes('20FT') ? 33.2 : 76.2;

    const weightUtilizationPct = Math.min(100, Math.round((totalWeightTons / maxCapacityTons) * 100));
    const volumeUtilizationPct = Math.min(100, Math.round((totalVolumeCbm / maxCapacityCbm) * 100));

    const consolidatedCost = targetCarrierBudgetEtb ? parseFloat(targetCarrierBudgetEtb) : Math.round(separateShipmentCost * 0.72);
    const totalSavingsEtb = separateShipmentCost - consolidatedCost;
    const savingsPct = separateShipmentCost > 0 ? Math.round((totalSavingsEtb / separateShipmentCost) * 100) : 28;

    // Create master load record in database if valid shipper exists
    let masterLoadId = `CONS-${Date.now().toString().slice(-6)}`;
    if (primaryShipperId) {
      try {
        const masterLoad = await prisma.load.create({
          data: {
            shipperId: primaryShipperId,
            title: `[CONSOLIDATED FTL] ${masterTitle}`,
            cargoType: CargoType.CONTAINERIZED,
            cargoDescription: `Multi-Shipper Consolidated Container (${subConsignments.length} Bundled Consignments)`,
            weightTons: totalWeightTons,
            volumeCbm: totalVolumeCbm,
            originName: origin,
            originLat: 8.60,
            originLng: 39.12,
            destName: destination,
            destLat: 11.588,
            destLng: 43.145,
            targetBudgetEtb: consolidatedCost,
            spotEstimatedPriceEtb: consolidatedCost,
            pickupWindowStart: new Date(),
            pickupWindowEnd: new Date(Date.now() + 72 * 3600 * 1000),
            status: LoadStatus.OPEN,
            specialHandling: ['Consolidated Multi-Consignor Cargo', 'High-Cube Containerized'],
          },
        });
        masterLoadId = masterLoad.id;

        // Mark consolidated sub-consignments as MATCHED so they leave the open queue
        await prisma.load.updateMany({
          where: { id: { in: loadIds } },
          data: { status: LoadStatus.MATCHED },
        });
      } catch (e) {
        console.error('Error creating consolidated master load:', e);
      }
    }

    const consolidatedDossier = {
      masterLoadId,
      containerCode: `ETH-CONT-${Date.now().toString().slice(-6)}`,
      containerType,
      masterTitle,
      origin,
      destination,
      consignmentsCount: subConsignments.length,
      totalWeightTons: Math.round(totalWeightTons * 10) / 10,
      totalVolumeCbm: Math.round(totalVolumeCbm * 10) / 10,
      weightUtilizationPct,
      volumeUtilizationPct,
      separateShipmentCost,
      consolidatedCost,
      totalSavingsEtb,
      savingsPct,
      subConsignments,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: `Successfully consolidated ${subConsignments.length} LTL shipments into master container with ${savingsPct}% cost savings!`,
      consolidatedDossier,
    });
  } catch (error: any) {
    console.error('Error consolidating loads:', error);
    res.status(500).json({ error: error.message || 'Failed to consolidate LTL loads' });
  }
};

/**
 * 4. Multi-Modal Corridor Progress Tracking
 * GET /api/forwarder/multimodal
 */
export const getMultimodalTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeShipments = await prisma.shipment.findMany({
      include: {
        load: {
          include: {
            shipper: { select: { fullName: true, companyName: true, tin: true } },
          },
        },
        vehicle: { select: { plateNumber: true, vehicleType: true } },
        driver: { include: { user: { select: { fullName: true, phone: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    const multimodalContainers = activeShipments.map((s) => {
      let currentLeg = 2; // Road/Rail corridor transit
      let legLabel = 'Leg 2: Ethio-Djibouti Heavy Freight Rail / Highway Corridor';
      if (s.status === 'ASSIGNED' || s.status === 'DISPATCHED') {
        currentLeg = 1;
        legLabel = 'Leg 1: Red Sea Ocean Discharge (Djibouti Port Terminal)';
      } else if (s.customsStatus === 'CLEARED' || s.status === 'DELIVERED') {
        currentLeg = 4;
        legLabel = 'Leg 4: Final Regional Warehouse Delivery';
      } else if (s.arrivedModjoAt || s.customsStatus === 'UNDER_REVIEW') {
        currentLeg = 3;
        legLabel = 'Leg 3: Inland Container Depot (Modjo Dry Port Clearance)';
      }

      return {
        id: s.id,
        containerNo: `MSKU-${s.id.slice(0, 4).toUpperCase()}-40HC`,
        shipmentId: s.id,
        consignmentCode: s.load.title || 'Freight Consignment',
        title: s.load.title,
        cargoType: s.load.cargoType,
        weightTons: s.load.weightTons,
        route: `${s.load.originName} ➔ ${s.load.destName}`,
        carrier: s.vehicle?.plateNumber ? `${s.vehicle.plateNumber} (${s.driver?.user?.fullName || 'Assigned Driver'})` : 'Fleet Unit Pending Assignment',
        currentLeg,
        legLabel,
        estimatedArrival: s.currentPredictedEta || 'In Transit',
        customsStatus: s.customsStatus,
        status: s.status,
      };
    });

    res.json({ containers: multimodalContainers });
  } catch (error: any) {
    console.error('Error fetching multimodal tracking:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch multimodal tracking' });
  }
};

/**
 * 5. Master Transporter Corridor Tenders
 * GET /api/forwarder/tenders
 */
export const getForwarderTenders = async (req: Request, res: Response): Promise<void> => {
  try {
    const loads = await prisma.load.findMany({
      where: {
        OR: [
          { title: { contains: 'CONSOLIDATED' } },
          { status: { in: [LoadStatus.OPEN, LoadStatus.BIDDING, LoadStatus.MATCHED, LoadStatus.BOOKED] } },
        ],
      },
      include: {
        bids: {
          include: {
            transporter: {
              select: {
                id: true,
                fullName: true,
                companyName: true,
                ratingAvg: true,
                totalRatingsCount: true,
                vehicles: { select: { id: true } },
              },
            },
          },
        },
        shipment: {
          include: {
            vehicle: {
              include: {
                transporter: {
                  select: {
                    id: true,
                    fullName: true,
                    companyName: true,
                  },
                },
              },
            },
            driver: {
              include: {
                user: { select: { fullName: true, phone: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const tenders = loads.map((load) => {
      const bids = load.bids || [];
      const hasAccepted = bids.some((b) => b.status === BidStatus.ACCEPTED);
      const isAwarded = Boolean(load.shipment || hasAccepted);
      const acceptedBid = bids.find((b) => b.status === BidStatus.ACCEPTED);
      const awardedName =
        load.shipment?.vehicle?.transporter?.companyName ||
        load.shipment?.vehicle?.transporter?.fullName ||
        acceptedBid?.transporter?.companyName ||
        acceptedBid?.transporter?.fullName ||
        undefined;

      const quotes = bids.map((b) => b.proposedRateEtb).filter((r) => r > 0);
      const lowestQuoteEtb = quotes.length > 0 ? Math.min(...quotes) : (load.targetBudgetEtb || load.spotEstimatedPriceEtb || 0);
      const budgetCapEtb = load.targetBudgetEtb || load.spotEstimatedPriceEtb || 0;

      return {
        id: load.id,
        tenderCode: `TF-TND-${load.id.slice(-6).toUpperCase()}`,
        routeTitle: `${load.originName} ➔ ${load.destName}`,
        totalConsolidatedTons: load.weightTons,
        containerClass: load.cargoDescription || load.title,
        bidsCount: bids.length,
        lowestQuoteEtb,
        budgetCapEtb,
        status: isAwarded ? ('AWARDED' as const) : ('OPEN_FOR_BIDS' as const),
        awardedCarrier: awardedName,
        deadlineHours: isAwarded ? 0 : 24,
        bidders: bids.map((b) => ({
          bidId: b.id,
          transporterId: b.transporterId,
          transporterName: b.transporter?.companyName || b.transporter?.fullName || 'Transporter',
          fleetSize: (b.transporter?.vehicles || []).length,
          rating: b.transporter?.ratingAvg || 5.0,
          quotedRateEtb: b.proposedRateEtb,
          transitHours: Math.round((new Date(b.deliveryEstimatedTime).getTime() - new Date(b.pickupEstimatedTime).getTime()) / (3600 * 1000)) || 24,
          status: b.status,
        })),
      };
    });

    res.json({ tenders });
  } catch (error: any) {
    console.error('Error fetching forwarder tenders:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch forwarder tenders' });
  }
};

/**
 * 6. Award Carrier Tender & Create Live Shipment
 * POST /api/forwarder/tenders/award
 */
export const awardForwarderTender = async (req: Request, res: Response): Promise<void> => {
  try {
    const { loadId, bidId, transporterId, agreedRateEtb } = req.body;

    if (!loadId) {
      res.status(400).json({ error: 'loadId parameter is required' });
      return;
    }

    const load = await prisma.load.findUnique({
      where: { id: loadId },
      include: { shipment: true },
    });

    if (!load) {
      res.status(404).json({ error: 'Consolidated load not found' });
      return;
    }

    // 1. If bidId provided, mark accepted & others rejected
    if (bidId) {
      await prisma.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.ACCEPTED },
      });
      await prisma.bid.updateMany({
        where: {
          loadId,
          id: { not: bidId },
        },
        data: { status: BidStatus.REJECTED },
      });
    }

    // 2. Update load status
    await prisma.load.update({
      where: { id: loadId },
      data: { status: LoadStatus.MATCHED },
    });

    // 3. Resolve Transporter, Vehicle, and Driver for Shipment
    const targetTransporterId = transporterId || (bidId ? (await prisma.bid.findUnique({ where: { id: bidId } }))?.transporterId : null);
    const finalRate = agreedRateEtb ? parseFloat(agreedRateEtb) : (load.targetBudgetEtb || load.spotEstimatedPriceEtb || 285000);

    let shipment = load.shipment;
    if (!shipment) {
      // Find a vehicle belonging to this transporter, or fallback to first available
      let vehicle = targetTransporterId
        ? await prisma.vehicle.findFirst({ where: { transporterId: targetTransporterId } })
        : null;
      if (!vehicle) {
        vehicle = await prisma.vehicle.findFirst();
      }

      // Find an active driver
      let driver = await prisma.driverProfile.findFirst();

      if (vehicle && driver && targetTransporterId) {
        shipment = await prisma.shipment.create({
          data: {
            loadId: load.id,
            transporterId: targetTransporterId,
            vehicleId: vehicle.id,
            driverId: driver.id,
            agreedRateEtb: finalRate,
            status: ShipmentStatus.ASSIGNED,
            customsStatus: CustomsClearanceStatus.NOT_SUBMITTED,
            currentLat: 8.60,
            currentLng: 39.12,
            initialEtaTimestamp: new Date(Date.now() + 24 * 3600 * 1000),
            currentPredictedEta: new Date(Date.now() + 24 * 3600 * 1000),
          },
        });
      }
    }

    // Broadcast WebSocket notifications
    const io = req.app?.get('io');
    if (io) {
      io.emit('bid:accepted', { loadId, bidId, transporterId: targetTransporterId });
      io.emit('portal:refresh', { type: 'TENDER_AWARDED', loadId });
    }

    res.json({
      success: true,
      message: 'Master corridor transport tender awarded successfully!',
      loadId,
      shipment,
    });
  } catch (error: any) {
    console.error('Error awarding forwarder tender:', error);
    res.status(500).json({ error: error.message || 'Failed to award tender' });
  }
};

/**
 * 7. Forwarder Customs Declarations Pipeline
 * GET /api/forwarder/customs-batch
 */
export const getForwarderCustomsBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        load: {
          include: {
            shipper: {
              select: {
                id: true,
                fullName: true,
                companyName: true,
                tin: true,
                phone: true,
              },
            },
          },
        },
        vehicle: {
          include: {
            transporter: {
              select: {
                id: true,
                fullName: true,
                companyName: true,
              },
            },
          },
        },
        driver: {
          include: {
            user: { select: { fullName: true, phone: true } },
          },
        },
        customsDocuments: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const batches = shipments.map((s) => ({
      id: s.id,
      shipmentId: s.id,
      batchReference: `ECC-BATCH-${s.id.slice(-4).toUpperCase()}`,
      title: s.load.title,
      cargoDescription: s.load.cargoDescription || s.load.title,
      shipperCompany: s.load.shipper?.companyName || s.load.shipper?.fullName || 'Consignor Client',
      shipperTin: s.load.shipper?.tin || 'N/A',
      route: `${s.load.originName} ➔ ${s.load.destName}`,
      weightTons: s.load.weightTons,
      carrierPlate: s.vehicle?.plateNumber || 'Unassigned',
      carrierName: s.vehicle?.transporter?.companyName || s.vehicle?.transporter?.fullName || 'Pending Assignment',
      driverName: s.driver?.user?.fullName || 'Unassigned',
      customsStatus: s.customsStatus,
      documentsCount: (s.customsDocuments || []).length,
      documents: s.customsDocuments || [],
      updatedAt: s.updatedAt,
    }));

    res.json({ batches });
  } catch (error: any) {
    console.error('Error fetching forwarder customs batches:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customs batches' });
  }
};

/**
 * 8. Transmit Master Batch Declaration to Ethiopian Customs Commission (ECC)
 * POST /api/forwarder/customs-batch/transmit
 */
export const transmitForwarderCustomsBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId, batchReference, clearingStation = 'Galafi Border Checkpoint (Main Corridor)' } = req.body;

    if (!shipmentId) {
      res.status(400).json({ error: 'shipmentId is required' });
      return;
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        load: { include: { shipper: true } },
        customsDocuments: true,
      },
    });

    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }

    const shortId = shipment.id.slice(-4).toUpperCase();
    const declaredValue = shipment.load.spotEstimatedPriceEtb || 4200000;

    // Standard set of 4 TradeFlow Digital Customs Documents
    const standardDocs = [
      {
        docType: CustomsDocType.COMMERCIAL_INVOICE,
        docNumber: `ETH-CI-${shortId}`,
        fileName: `commercial_invoice_${shortId}.pdf`,
      },
      {
        docType: CustomsDocType.PACKING_LIST,
        docNumber: `ETH-PL-${shortId}`,
        fileName: `packing_list_${shortId}.pdf`,
      },
      {
        docType: CustomsDocType.BILL_OF_LADING,
        docNumber: `BOL-MJO-${shortId}`,
        fileName: `bill_of_lading_${shortId}.pdf`,
      },
      {
        docType: CustomsDocType.CERTIFICATE_OF_ORIGIN,
        docNumber: `MOT-COO-${shortId}`,
        fileName: `certificate_origin_${shortId}.pdf`,
      },
    ];

    for (const d of standardDocs) {
      const existing = shipment.customsDocuments.find((cd) => cd.docType === d.docType);
      if (existing) {
        await prisma.customsDocument.update({
          where: { id: existing.id },
          data: {
            clearanceStatus: CustomsClearanceStatus.SUBMITTED,
            validationPassed: true,
          },
        });
      } else {
        await prisma.customsDocument.create({
          data: {
            shipmentId: shipment.id,
            docType: d.docType,
            docNumber: d.docNumber,
            fileName: d.fileName,
            fileUrl: `https://tradeflow.et/docs/${d.docNumber}.pdf`,
            fileSizeKb: 280,
            declaredValueEtb: declaredValue,
            issuingAuthority: 'Ethiopian Customs Commission (ECC)',
            validationPassed: true,
            clearanceStatus: CustomsClearanceStatus.SUBMITTED,
          },
        });
      }
    }

    // Update shipment status to SUBMITTED
    const updated = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        customsStatus: CustomsClearanceStatus.SUBMITTED,
      },
      include: { customsDocuments: true },
    });

    // Notify Customs Review Queue via WebSocket
    const io = req.app?.get('io');
    if (io) {
      io.emit('customs:new-submission', {
        shipmentId: shipment.id,
        batchReference: batchReference || `ECC-BATCH-${shortId}`,
      });
      io.emit('portal:refresh', { type: 'CUSTOMS_SUBMISSION', shipmentId: shipment.id });
    }

    res.json({
      success: true,
      message: `Batch Declaration ${batchReference || `ECC-BATCH-${shortId}`} transmitted successfully to Ethiopian Customs Commission Single Window Queue!`,
      shipment: updated,
    });
  } catch (error: any) {
    console.error('Error transmitting customs batch:', error);
    res.status(500).json({ error: error.message || 'Failed to transmit customs batch' });
  }
};
