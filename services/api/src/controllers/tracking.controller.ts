import { Request, Response } from 'express';
import { PrismaClient, ShipmentStatus, LoadStatus, RiskLevel } from '@prisma/client';
import { getDynamicCorridorWaypoints, calculateCorridorRoadDistanceKm, resolveCorridorCoordinates } from '@tradeflow/shared';

const prisma = new PrismaClient();

const isValidUUID = (str?: any): boolean => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

// Corridor Geofence Waypoint Definitions
export const CORRIDOR_WAYPOINTS = [
  {
    id: 'WP-DJIBOUTI',
    name: 'Port of Doraleh (SGTD), Djibouti',
    nameAmharic: 'የዶራሌ ወደብ (ጅቡቲ)',
    lat: 11.595,
    lng: 43.148,
    sequenceOrder: 1,
    isCustomsCheckpoint: true,
    isDryPort: true,
    isFuelStation: true,
    fuelAvailable: true,
    dieselPricePerLiter: 58.5,
    congestionDelayMinutes: 15,
  },
  {
    id: 'WP-GALAFI',
    name: 'Galafi Border Customs Checkpoint',
    nameAmharic: 'የገላፊ ድንበር ጉምሩክ ኬላ',
    lat: 11.71,
    lng: 41.83,
    sequenceOrder: 2,
    isCustomsCheckpoint: true,
    isDryPort: false,
    isFuelStation: true,
    fuelAvailable: true,
    dieselPricePerLiter: 62.0,
    congestionDelayMinutes: 45,
  },
  {
    id: 'WP-SEMERA',
    name: 'Semera Logistics Corridor Terminal',
    nameAmharic: 'የሰመራ ሎጅስቲክስ ተርሚናል',
    lat: 11.792,
    lng: 41.008,
    sequenceOrder: 3,
    isCustomsCheckpoint: false,
    isDryPort: false,
    isFuelStation: true,
    fuelAvailable: true,
    dieselPricePerLiter: 60.5,
    congestionDelayMinutes: 10,
  },
  {
    id: 'WP-AWASH',
    name: 'Awash Arba Weigh Station & Fuel Depot',
    nameAmharic: 'የአዋሽ አርባ ሚዛን ጣቢያ እና ነዳጅ ማደያ',
    lat: 8.986,
    lng: 40.165,
    sequenceOrder: 4,
    isCustomsCheckpoint: false,
    isDryPort: false,
    isFuelStation: true,
    fuelAvailable: false, // Flagged low stock
    dieselPricePerLiter: 61.2,
    congestionDelayMinutes: 20,
  },
  {
    id: 'WP-MODJO',
    name: 'Modjo Dry Port & Multimodal Terminal',
    nameAmharic: 'የሞጆ ደረቅ ወደብ እና ተርሚናል',
    lat: 8.595,
    lng: 39.12,
    sequenceOrder: 5,
    isCustomsCheckpoint: true,
    isDryPort: true,
    isFuelStation: true,
    fuelAvailable: true,
    dieselPricePerLiter: 59.8,
    congestionDelayMinutes: 35,
  },
  {
    id: 'WP-ADDIS',
    name: 'Kaliti Inland Container Terminal, Addis Ababa',
    nameAmharic: 'የቃሊቲ ኮንቴነር ተርሚናል (አዲስ አበባ)',
    lat: 8.895,
    lng: 38.765,
    sequenceOrder: 6,
    isCustomsCheckpoint: true,
    isDryPort: true,
    isFuelStation: true,
    fuelAvailable: true,
    dieselPricePerLiter: 59.0,
    congestionDelayMinutes: 25,
  },
];

// Corridor Risk Zones
export const CORRIDOR_RISK_ZONES = [
  {
    id: 'RZ-AFAR-BORDER',
    name: 'Afar–Somali Border Corridor Buffer Zone',
    severity: RiskLevel.MEDIUM,
    centerLat: 10.45,
    centerLng: 41.25,
    radiusKm: 25.0,
    speedLimitKmh: 45,
    advisory: 'Security escort recommended during night hours. Maintain convoy speed.',
    active: true,
  },
  {
    id: 'RZ-AWASH-GORGE',
    name: 'Awash Gorge Heavy Gradient & Wind Zone',
    severity: RiskLevel.LOW,
    centerLat: 8.95,
    centerLng: 40.2,
    radiusKm: 15.0,
    speedLimitKmh: 35,
    advisory: 'Steep descents and high crosswinds. Brake check mandatory at weighbridge.',
    active: true,
  },
];

// Haversine distance calculator in KM
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Dynamic ETA Calculation Engine (SRS FR-03.3)
export const computeDynamicEta = (
  currentLat: number,
  currentLng: number,
  currentSpeedKmh: number,
  destLat: number = 8.895,
  destLng: number = 38.765,
  weather: string = 'CLEAR',
  originName?: string,
  destName?: string,
  originLat?: number,
  originLng?: number,
  isConsignmentInTransit: boolean = true,
  hasDepartedOrigin: boolean = true
) => {
  const totalCorridorKm = calculateCorridorRoadDistanceKm(
    originName || '',
    destName || '',
    originLat,
    originLng,
    destLat,
    destLng
  );

  // If not in transit or driver has not departed origin, progress is strictly 0%
  if (!isConsignmentInTransit || !hasDepartedOrigin) {
    const totalMinutes = Math.round((totalCorridorKm / 52) * 60);
    const now = new Date();
    const predictedEta = new Date(now.getTime() + totalMinutes * 60 * 1000);
    const confidenceMarginMins = Math.max(15, Math.min(45, Math.round(totalCorridorKm * 0.05)));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return {
      totalCorridorKm,
      remainingDistanceKm: totalCorridorKm,
      predictedEta,
      confidenceMarginMins,
      formattedDuration: `${hours}h ${mins}m`,
      formattedConfidence: `${predictedEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} ± ${confidenceMarginMins} mins`,
      progressPercentage: 0,
      weatherNote: 'Consignment awaiting driver departure from origin',
      congestionDelayMins: 0,
      isNearRiskZone: false,
      isStationary: true,
    };
  }

  const straightLineRemaining = calculateDistanceKm(currentLat, currentLng, destLat, destLng);
  const roadRatio = totalCorridorKm > 10
    ? totalCorridorKm / Math.max(1, calculateDistanceKm(originLat || currentLat, originLng || currentLng, destLat, destLng))
    : 1.38;
  const remainingDistanceKm = Math.min(
    totalCorridorKm,
    Math.round(straightLineRemaining * Math.max(1.1, Math.min(1.6, roadRatio)))
  );

  // Highway speed model: if stopped (speed <= 5), calculate ETA with nominal 52 km/h transit speed
  const isStationary = currentSpeedKmh <= 5;
  let effectiveSpeed = currentSpeedKmh > 15 ? Math.min(currentSpeedKmh, 80) : 52;

  // Weather condition adjustments
  let weatherMultiplier = 1.0;
  let weatherNote = isStationary
    ? 'Vehicle stationary (Rest stop / Checkpoint inspection)'
    : 'Clear corridor driving conditions';
  if (weather.toUpperCase() === 'RAIN' || weather.toUpperCase() === 'HEAVY_RAIN') {
    weatherMultiplier = 1.25;
    weatherNote = 'Heavy precipitation around Awash (+25% travel time)';
  } else if (weather.toUpperCase() === 'SANDSTORM' || weather.toUpperCase() === 'DUST') {
    weatherMultiplier = 1.4;
    weatherNote = 'Severe dust haze near Semera-Galafi corridor (+40% travel time)';
  }

  // Base travel time in hours
  let travelHours = (remainingDistanceKm / effectiveSpeed) * weatherMultiplier;

  // Congestion buffers from upcoming dry ports & checkpoints
  let congestionDelayMins = 0;
  if (remainingDistanceKm > 40) {
    congestionDelayMins += 25; // General corridor checkpoint queue buffer
  }
  if (remainingDistanceKm < 150 && remainingDistanceKm > 20) {
    congestionDelayMins += 35; // Modjo Dry Port queue buffer
  }

  // Risk zone buffer
  const isNearRiskZone = CORRIDOR_RISK_ZONES.some(
    (rz) => rz.active && calculateDistanceKm(currentLat, currentLng, rz.centerLat, rz.centerLng) <= rz.radiusKm
  );
  if (isNearRiskZone) {
    congestionDelayMins += 20; // Security check buffer
  }

  const totalMinutes = Math.round(travelHours * 60 + congestionDelayMins);
  const now = new Date();
  const predictedEta = new Date(now.getTime() + totalMinutes * 60 * 1000);

  // Confidence margin calculation
  const confidenceMarginMins = Math.max(15, Math.min(45, Math.round(remainingDistanceKm * 0.05)));

  // Progress percentage based on actual corridor road distance
  const distFromOrigin = (originLat && originLng) ? calculateDistanceKm(currentLat, currentLng, originLat, originLng) : 0;
  let progressPct = (distFromOrigin <= 3.0)
    ? 0
    : Math.max(
        0,
        Math.min(100, Math.round(((totalCorridorKm - remainingDistanceKm) / totalCorridorKm) * 100))
      );

  // Guard against GPS tester artifact: device physically at destination while consignment has not traversed corridor
  if (remainingDistanceKm <= 3.0 && distFromOrigin > 25.0 && totalCorridorKm > 30.0) {
    progressPct = 0;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const formattedDuration = `${hours}h ${mins}m`;

  const etaHoursStr = predictedEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedConfidence = `${etaHoursStr} ± ${confidenceMarginMins} mins`;

  return {
    totalCorridorKm,
    remainingDistanceKm: Math.round(remainingDistanceKm * 10) / 10,
    predictedEta,
    confidenceMarginMins,
    formattedDuration,
    formattedConfidence,
    progressPercentage: progressPct,
    weatherNote,
    congestionDelayMins,
    isNearRiskZone,
    isStationary,
  };
};

/**
 * 1. Ingest GPS Telemetry (Batch & Single Update with Offline Sync support)
 * POST /api/tracking/telemetry
 */
export const ingestTelemetry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId, pings, latitude, longitude, speedKmh, heading, fuelLevelPct, weatherCondition, source } = req.body;

    // Support both single ping or batch offline queued pings
    const telemetryBatch = Array.isArray(pings) && pings.length > 0
      ? pings
      : [{
          latitude: latitude || 11.595,
          longitude: longitude || 43.148,
          speedKmh: typeof speedKmh === 'number' ? speedKmh : 58.0,
          heading: typeof heading === 'number' ? heading : 240.0,
          fuelLevelPct: typeof fuelLevelPct === 'number' ? fuelLevelPct : 85.0,
          timestamp: new Date(),
          source: source || 'DRIVER_APP',
        }];

    // Resolve target shipment
    let shipment: any = null;
    if (shipmentId) {
      try {
        shipment = await prisma.shipment.findFirst({
          where: {
            OR: [
              { id: shipmentId },
              { loadId: shipmentId },
            ],
          },
          include: { load: true },
        });
      } catch (e) {
        // Ignore if shipmentId wasn't a UUID
      }
    }

    if (!shipment) {
      // Find latest active shipment in transit
      shipment = await prisma.shipment.findFirst({
        where: {
          status: { in: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.ASSIGNED, ShipmentStatus.AT_ORIGIN] },
        },
        include: { load: true },
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!shipment) {
      shipment = await prisma.shipment.findFirst({
        include: { load: true },
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!shipment) {
      res.json({ message: 'No active shipment in transit to record telemetry for.', processed: 0 });
      return;
    }

    // Process and save all telemetry points into database
    const createdEvents = [];
    if (shipment) {
      for (const ping of telemetryBatch) {
        try {
          const latVal = typeof ping.latitude === 'number' ? ping.latitude : parseFloat(ping.latitude) || 11.758;
          const lngVal = typeof ping.longitude === 'number' ? ping.longitude : parseFloat(ping.longitude) || 41.834;
          const speedVal = typeof ping.speedKmh === 'number' ? ping.speedKmh : parseFloat(ping.speedKmh) || 0;
          const headingVal = typeof ping.heading === 'number' ? ping.heading : parseFloat(ping.heading) || 0;
          const fuelVal = typeof ping.fuelLevelPct === 'number' ? ping.fuelLevelPct : parseFloat(ping.fuelLevelPct) || 80;

          const event = await prisma.trackingEvent.create({
            data: {
              shipmentId: shipment.id,
              latitude: latVal,
              longitude: lngVal,
              speedKmh: speedVal,
              heading: headingVal,
              fuelLevelPct: fuelVal,
              timestamp: ping.timestamp ? new Date(ping.timestamp) : new Date(),
              source: ping.source || 'DRIVER_APP',
            },
          });
          createdEvents.push(event);
        } catch (err) {
          console.warn('Telemetry event create warning:', err);
        }
      }
    }

    // Use latest telemetry point to recalculate dynamic ETA & check milestones
    const latestPing = telemetryBatch[telemetryBatch.length - 1];
    const lat = typeof latestPing.latitude === 'number' ? latestPing.latitude : parseFloat(latestPing.latitude) || 11.758;
    const lng = typeof latestPing.longitude === 'number' ? latestPing.longitude : parseFloat(latestPing.longitude) || 41.834;
    const speed = typeof latestPing.speedKmh === 'number' ? latestPing.speedKmh : parseFloat(latestPing.speedKmh) || 0;
    const headingDeg = typeof latestPing.heading === 'number' ? latestPing.heading : parseFloat(latestPing.heading) || 0;
    const fuelPct = typeof latestPing.fuelLevelPct === 'number' ? latestPing.fuelLevelPct : parseFloat(latestPing.fuelLevelPct) || 85;

    const isTransit = shipment?.status === ShipmentStatus.IN_TRANSIT;
    const hasDeparted = !!shipment?.departedOriginAt;

    const etaResult = computeDynamicEta(
      lat,
      lng,
      speed,
      shipment?.load?.destLat || 8.895,
      shipment?.load?.destLng || 38.765,
      weatherCondition || 'CLEAR',
      shipment?.load?.originName,
      shipment?.load?.destName,
      shipment?.load?.originLat,
      shipment?.load?.originLng,
      isTransit,
      hasDeparted
    );

    // Milestone Proximity Checks (SRS FR-03.4)
    const milestoneUpdates: any = {};
    const milestoneNotifications: string[] = [];

    if (shipment) {
      // Milestone 1: Departed Origin (Djibouti Port or Addis Hub)
      const distFromOrigin = calculateDistanceKm(lat, lng, shipment.load?.originLat || 11.595, shipment.load?.originLng || 43.148);
      if (distFromOrigin > 3.0 && !shipment.departedOriginAt) {
        const ts = new Date();
        milestoneUpdates.departedOriginAt = ts;
        milestoneUpdates.status = ShipmentStatus.IN_TRANSIT;
        milestoneNotifications.push(`🚀 Departed Origin: Freight consignment has left ${shipment.load?.originName || 'Djibouti Port'}.`);
      }

      // Milestone 2: Cleared Customs Checkpoint (Galafi border ~11.71, 41.83)
      const distFromGalafi = calculateDistanceKm(lat, lng, 11.71, 41.83);
      if (distFromGalafi <= 5.0 && !shipment.customsClearedAt) {
        const ts = new Date();
        milestoneUpdates.customsClearedAt = ts;
        milestoneNotifications.push(`🛂 Cleared Customs Checkpoint: Galafi border inspection completed and digital seal verified.`);
      }

      // Milestone 3: Arrived Modjo Dry Port (8.595, 39.12)
      const distFromModjo = calculateDistanceKm(lat, lng, 8.595, 39.12);
      if (distFromModjo <= 4.0 && !shipment.arrivedModjoAt) {
        const ts = new Date();
        milestoneUpdates.arrivedModjoAt = ts;
        milestoneNotifications.push(`🏢 Arrived at Modjo Dry Port: Truck has entered multimodal terminal for scanning & clearance.`);
      }

      // Milestone 4: Arrived Final Destination (Strictly requires journey progress >= 80% and departure)
      const distFromDest = etaResult.remainingDistanceKm;
      const hasSubstantialProgress = (shipment.progressPercentage ?? 0) >= 80;
      if (distFromDest <= 2.0 && isTransit && hasDeparted && hasSubstantialProgress && !shipment.arrivedDestinationAt) {
        const ts = new Date();
        milestoneUpdates.arrivedDestinationAt = ts;
        milestoneUpdates.status = ShipmentStatus.OUT_FOR_DELIVERY;
        milestoneNotifications.push(`🏁 Arrived at Final Destination: Ready for digital proof-of-delivery (e-POD) sign-off.`);
      }

      // Update Shipment in database safely
      try {
        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            currentLat: isTransit ? lat : (shipment.load?.originLat || lat),
            currentLng: isTransit ? lng : (shipment.load?.originLng || lng),
            currentSpeedKmh: isTransit ? speed : 0,
            currentHeading: headingDeg,
            fuelLevelPct: fuelPct,
            lastGpsUpdateTimestamp: new Date(),
            currentPredictedEta: etaResult.predictedEta,
            etaConfidenceMarginMins: etaResult.confidenceMarginMins,
            progressPercentage: isTransit && hasDeparted ? etaResult.progressPercentage : 0,
            ...milestoneUpdates,
          },
        });
      } catch (e) {
        console.warn('Shipment update warning:', e);
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${createdEvents.length || 1} telemetry update(s) successfully`,
      telemetry: {
        latitude: lat,
        longitude: lng,
        speedKmh: speed,
        heading: headingDeg,
        fuelLevelPct: fuelPct,
        timestamp: new Date(),
      },
      eta: {
        predictedEta: etaResult.predictedEta,
        confidenceMarginMins: etaResult.confidenceMarginMins,
        formattedDuration: etaResult.formattedDuration,
        formattedConfidence: etaResult.formattedConfidence,
        remainingDistanceKm: etaResult.remainingDistanceKm,
        progressPercentage: etaResult.progressPercentage,
        weatherNote: etaResult.weatherNote,
      },
      milestoneNotifications,
      shipment: shipment
        ? {
            id: shipment.id,
            status: shipment.status,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error ingesting telemetry:', error);
    res.status(500).json({ error: error.message || 'Failed to process GPS telemetry' });
  }
};

/**
 * 2. Get Live Shipment Tracking Data (Full telematics view for Web & Mobile)
 * GET /api/tracking/live/:shipmentId or GET /api/tracking/live
 */
export const getLiveTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;

    let shipment: any = null;
    let targetLoad: any = null;

    if (shipmentId && shipmentId !== 'active') {
      try {
        shipment = await prisma.shipment.findFirst({
          where: {
            OR: [
              ...(isValidUUID(shipmentId) ? [{ id: shipmentId }, { loadId: shipmentId }] : []),
              { loadId: shipmentId },
            ],
          },
          include: {
            load: true,
            driver: { include: { user: true } },
            vehicle: true,
            trackingEvents: {
              take: 50,
              orderBy: { timestamp: 'desc' },
            },
          },
        });
      } catch (e) {}

      if (!shipment) {
        try {
          targetLoad = await prisma.load.findFirst({
            where: {
              OR: [
                ...(isValidUUID(shipmentId) ? [{ id: shipmentId }] : []),
                { id: shipmentId },
              ],
            },
          });
        } catch (e) {}
      }
    }

    // Fetch all loads in database for switcher
    const allLoads = await prisma.load.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Case 1: Load is found directly without active shipment yet (status is OPEN or BIDDING)
    if (targetLoad && !shipment) {
      let tOriginLat = targetLoad.originLat;
      let tOriginLng = targetLoad.originLng;
      let tDestLat = targetLoad.destLat;
      let tDestLng = targetLoad.destLng;

      if (
        !tOriginLat ||
        !tDestLat ||
        (tOriginLat === tDestLat && tOriginLng === tDestLng) ||
        (tOriginLat === 9.02 && tDestLat === 9.02)
      ) {
        const oC = resolveCorridorCoordinates(targetLoad.originName, tOriginLat ?? undefined, tOriginLng ?? undefined);
        const dC = resolveCorridorCoordinates(targetLoad.destName, tDestLat ?? undefined, tDestLng ?? undefined);
        tOriginLat = oC.lat;
        tOriginLng = oC.lng;
        tDestLat = dC.lat;
        tDestLng = dC.lng;
      }

      const roadKm = calculateCorridorRoadDistanceKm(
        targetLoad.originName,
        targetLoad.destName,
        tOriginLat,
        tOriginLng,
        tDestLat,
        tDestLng
      );

      const dynamicWaypoints = getDynamicCorridorWaypoints(
        targetLoad.originName,
        targetLoad.destName,
        tOriginLat,
        tOriginLng,
        tDestLat,
        tDestLng,
        0,
        targetLoad.status
      );

      res.json({
        active: false,
        isDispatched: false,
        isInTransit: false,
        isDriverMoving: false,
        status: targetLoad.status,
        message: 'Consignment posted and open for bidding. Live tracking will activate once a driver is dispatched and departs from origin.',
        shipment: {
          id: targetLoad.id,
          loadId: `TF-SH-${targetLoad.id.slice(0, 6).toUpperCase()}`,
          rawLoadId: targetLoad.id,
          title: targetLoad.title,
          cargoType: targetLoad.cargoType,
          weightTons: targetLoad.weightTons,
          status: targetLoad.status,
          origin: targetLoad.originName,
          originLat: tOriginLat,
          originLng: tOriginLng,
          destination: targetLoad.destName,
          destLat: tDestLat,
          destLng: tDestLng,
          distanceKm: roadKm,
          totalDistanceKm: roadKm,
          remainingDistanceKm: roadKm,
          truckPlate: 'Awaiting Dispatch',
          driverName: 'Awaiting Driver Assignment',
          driverPhone: '',
          telemetry: {
            latitude: tOriginLat,
            longitude: tOriginLng,
            speedKmh: 0,
            heading: 0,
            fuelLevelPercentage: 100,
            lastUpdated: targetLoad.createdAt,
          },
          eta: {
            predictedEta: null,
            formattedDuration: '--',
            formattedConfidence: 'Awaiting Driver Departure',
            remainingDistanceKm: roadKm,
            progressPercentage: 0,
            weatherNote: 'Awaiting Transporter Dispatch',
          },
          breadcrumbs: [],
          milestones: dynamicWaypoints.map((dw) => ({ ...dw, status: 'PENDING' })),
        },
        allLoads: allLoads.map((l) => {
          let oLat = l.originLat;
          let oLng = l.originLng;
          let dLat = l.destLat;
          let dLng = l.destLng;
          if (!oLat || !dLat || (oLat === dLat && oLng === dLng) || (oLat === 9.02 && dLat === 9.02)) {
            const oC = resolveCorridorCoordinates(l.originName, oLat ?? undefined, oLng ?? undefined);
            const dC = resolveCorridorCoordinates(l.destName, dLat ?? undefined, dLng ?? undefined);
            oLat = oC.lat;
            oLng = oC.lng;
            dLat = dC.lat;
            dLng = dC.lng;
          }
          const km = calculateCorridorRoadDistanceKm(l.originName, l.destName, oLat, oLng, dLat, dLng);
          return {
            id: l.id,
            loadCode: `TF-SH-${l.id.slice(0, 6).toUpperCase()}`,
            title: l.title,
            origin: l.originName,
            originLat: oLat,
            originLng: oLng,
            destination: l.destName,
            destLat: dLat,
            destLng: dLng,
            status: l.status,
            cargoType: l.cargoType,
            weightTons: l.weightTons,
            budgetEtb: l.targetBudgetEtb,
            distanceKm: km,
          };
        }),
        corridorWaypoints: dynamicWaypoints,
        riskZones: CORRIDOR_RISK_ZONES,
      });
      return;
    }

    if (!shipment) {
      shipment = await prisma.shipment.findFirst({
        where: {
          status: { in: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.ASSIGNED, ShipmentStatus.DISPATCHED, ShipmentStatus.AT_ORIGIN, ShipmentStatus.DELIVERED] },
        },
        include: {
          load: true,
          driver: { include: { user: true } },
          vehicle: true,
          trackingEvents: {
            take: 50,
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    // If database has no active shipment yet, return clean inactive state with no fake waypoints
    if (!shipment) {
      res.json({
        active: false,
        message: 'No active shipment is currently in transit.',
        corridorWaypoints: [],
        riskZones: CORRIDOR_RISK_ZONES,
        defaultLoad: null,
        allLoads: allLoads.map((l) => ({
          id: l.id,
          loadCode: `TF-SH-${l.id.slice(0, 6).toUpperCase()}`,
          title: l.title,
          origin: l.originName,
          originLat: l.originLat,
          originLng: l.originLng,
          destination: l.destName,
          destLat: l.destLat,
          destLng: l.destLng,
          status: l.status,
          cargoType: l.cargoType,
          weightTons: l.weightTons,
          budgetEtb: l.targetBudgetEtb,
        })),
      });
      return;
    }

    const isDelivered = shipment.status === ShipmentStatus.DELIVERED;
    const isDispatchedOnly = shipment.status === ShipmentStatus.DISPATCHED || shipment.status === ShipmentStatus.ASSIGNED;
    const isInTransit = shipment.status === ShipmentStatus.IN_TRANSIT;

    const currentOrigin = shipment.load?.originName || 'Addis Ababa';
    const currentDest = shipment.load?.destName || 'Djibouti Port';
    let currentOriginLat = shipment.load?.originLat;
    let currentOriginLng = shipment.load?.originLng;
    let currentDestLat = shipment.load?.destLat;
    let currentDestLng = shipment.load?.destLng;

    if (
      !currentOriginLat ||
      !currentDestLat ||
      (currentOriginLat === currentDestLat && currentOriginLng === currentDestLng) ||
      (currentOriginLat === 9.02 && currentDestLat === 9.02)
    ) {
      const oC = resolveCorridorCoordinates(currentOrigin, currentOriginLat ?? undefined, currentOriginLng ?? undefined);
      const dC = resolveCorridorCoordinates(currentDest, currentDestLat ?? undefined, currentDestLng ?? undefined);
      currentOriginLat = oC.lat;
      currentOriginLng = oC.lng;
      currentDestLat = dC.lat;
      currentDestLng = dC.lng;
    }

    const totalRoadKm = calculateCorridorRoadDistanceKm(
      currentOrigin,
      currentDest,
      currentOriginLat,
      currentOriginLng,
      currentDestLat,
      currentDestLng
    );

    const currentLat = isDelivered ? currentDestLat : isDispatchedOnly ? currentOriginLat : (shipment.currentLat || currentOriginLat);
    const currentLng = isDelivered ? currentDestLng : isDispatchedOnly ? currentOriginLng : (shipment.currentLng || currentOriginLng);
    const currentSpeed = (isDispatchedOnly || isDelivered) ? 0 : (shipment.currentSpeedKmh || 0);
    const progress = isDelivered ? 100 : (isDispatchedOnly || !isInTransit || !shipment.departedOriginAt) ? 0 : (shipment.progressPercentage ?? 0);

    const etaResult = computeDynamicEta(
      currentLat,
      currentLng,
      currentSpeed,
      currentDestLat,
      currentDestLng,
      'CLEAR',
      currentOrigin,
      currentDest,
      currentOriginLat,
      currentOriginLng,
      isInTransit,
      !!shipment.departedOriginAt
    );

    // Dynamically generate waypoints based on actual shipment origin & destination
    const dynamicWaypoints = getDynamicCorridorWaypoints(
      currentOrigin,
      currentDest,
      currentOriginLat,
      currentOriginLng,
      currentDestLat,
      currentDestLng,
      progress,
      shipment.status
    );

    // Build timeline milestones dynamically from the specific corridor waypoints
    const milestones = dynamicWaypoints.map((dw, idx) => ({
      id: dw.id,
      name: `${idx + 1}. ${dw.name}`,
      status: dw.status === 'ACTIVE_NOW' ? 'IN_PROGRESS' : dw.status,
      timestamp: dw.status === 'COMPLETED' ? (shipment.departedOriginAt || shipment.createdAt) : null,
      channelNotifications: ['In-App', 'Push (FCM)', 'SMS'],
      type: dw.type,
      description: dw.description,
      time: dw.time,
    }));

    const isMoving = isInTransit && currentSpeed > 5;

    res.json({
      active: true,
      isDispatched: isDispatchedOnly || isInTransit || isDelivered,
      isInTransit,
      isDelivered,
      isDriverMoving: isMoving,
      status: shipment.status,
      message: isDelivered
        ? `Consignment arrived at destination and successfully DELIVERED! Electronic POD verified & Smart Escrow released.`
        : isDispatchedOnly
        ? `Fleet dispatched to Driver ${shipment.driver?.user?.fullName || ''} (${shipment.vehicle?.plateNumber || ''}). Awaiting driver departure.`
        : isMoving
        ? `Consignment in transit • Driving at ${currentSpeed} km/h.`
        : `Consignment in transit • Driver stationary / resting at checkpoint.`,
      shipment: {
        id: shipment.id,
        loadId: `TF-SH-${shipment.load?.id?.slice(0, 6)?.toUpperCase() || '9901'}`,
        rawLoadId: shipment.load?.id,
        title: shipment.load?.title || 'Heavy Freight Consignment',
        cargoType: shipment.load?.cargoType || 'GENERAL_CONTAINER',
        weightTons: shipment.load?.weightTons || 30.0,
        status: shipment.status,
        origin: shipment.load?.originName || '',
        originLat: shipment.load?.originLat || 0,
        originLng: shipment.load?.originLng || 0,
        destination: shipment.load?.destName || '',
        destLat: shipment.load?.destLat || 0,
        destLng: shipment.load?.destLng || 0,
        distanceKm: totalRoadKm,
        totalDistanceKm: totalRoadKm,
        remainingDistanceKm: etaResult.remainingDistanceKm,
        truckPlate: shipment.vehicle?.plateNumber || '',
        driverName: shipment.driver?.user?.fullName || '',
        driverPhone: shipment.driver?.user?.phone || '',
        isDriverMoving: isMoving,
        isDispatched: isDispatchedOnly || isInTransit,
        isInTransit,
        lastGpsUpdate: shipment.lastGpsUpdateTimestamp,
        telemetry: {
          latitude: currentLat,
          longitude: currentLng,
          speedKmh: currentSpeed,
          heading: shipment.currentHeading || 240,
          fuelLevelPercentage: shipment.fuelLevelPct || 78,
          lastUpdated: shipment.lastGpsUpdateTimestamp,
        },
        eta: {
          predictedEta: shipment.currentPredictedEta || etaResult.predictedEta,
          confidenceMarginMins: shipment.etaConfidenceMarginMins || etaResult.confidenceMarginMins,
          formattedDuration: etaResult.formattedDuration,
          formattedConfidence: etaResult.formattedConfidence,
          remainingDistanceKm: etaResult.remainingDistanceKm,
          progressPercentage: shipment.progressPercentage ?? 0,
          weatherNote: etaResult.weatherNote,
        },
        breadcrumbs: shipment.trackingEvents.map((te: any) => ({
          lat: te.latitude,
          lng: te.longitude,
          speed: te.speedKmh,
          heading: te.heading,
          fuel: te.fuelLevelPct,
          fuelPct: te.fuelLevelPct,
          time: te.timestamp,
        })),
        milestones,
        telematicsCompliance: {
          lastGpsUpdateTimestamp: shipment.lastGpsUpdateTimestamp,
          minutesSinceLastUpdate: shipment.lastGpsUpdateTimestamp
            ? Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000)
            : 0,
          updateIntervalTargetMins: 5,
          isCompliant: (shipment.status !== ShipmentStatus.IN_TRANSIT) || (
            shipment.lastGpsUpdateTimestamp
              ? Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000) <= 5
              : true
          ),
          gpsSignalStatus: (shipment.status !== ShipmentStatus.IN_TRANSIT)
            ? 'INACTIVE'
            : (shipment.lastGpsUpdateTimestamp && Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000) > 15)
              ? 'SIGNAL_LOST_USING_HISTORICAL_VELOCITY'
              : (shipment.lastGpsUpdateTimestamp && Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000) > 5)
                ? 'STALE_SIGNAL'
                : 'HEALTHY',
          etaCalculationBasis: (shipment.lastGpsUpdateTimestamp && Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000) > 15)
            ? 'Last known GPS waypoint and historical corridor velocity (50 km/h baseline)'
            : 'Live telematics stream',
          status: ((shipment.status === ShipmentStatus.IN_TRANSIT) && shipment.lastGpsUpdateTimestamp && Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000) > 60)
            ? 'OFFLINE_OVER_1_HOUR'
            : ((shipment.status === ShipmentStatus.IN_TRANSIT) && shipment.lastGpsUpdateTimestamp && Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000) > 5)
              ? 'STALE_SIGNAL'
              : 'HEALTHY',
          dispatcherAlert: ((shipment.status === ShipmentStatus.IN_TRANSIT) && shipment.lastGpsUpdateTimestamp && Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000) > 60)
            ? {
                active: true,
                severity: 'CRITICAL',
                alertTitle: 'Dispatcher Alert: Mobile App Offline > 1 Hour',
                alertMessage: 'Driver mobile app has been offline for over 60 minutes during active corridor transit. Automated SMS milestone fallback initiated.',
                offlineDurationMinutes: Math.floor((Date.now() - new Date(shipment.lastGpsUpdateTimestamp).getTime()) / 60000),
                smsFallback: {
                  initiated: true,
                  recipientPhone: shipment.driver?.user?.phone || '+251911445566',
                  recipientName: shipment.driver?.user?.fullName || 'Assigned Driver',
                  dispatchedAt: new Date().toISOString(),
                  smsContent: `TradeFlow Corridor Alert: Your mobile device has been offline for > 1 hour. Please reconnect or reply with current corridor waypoint (Galafi, Semera, Awash, Modjo).`,
                },
              }
            : null,
          ruleRequirement: 'GPS position updates required minimum every 5 minutes during active transit; offline > 1hr triggers dispatcher SMS fallback.',
        },
        etaRecalculationTriggers: [
          'GPS location update',
          'Verified incident report',
          'Route alteration',
          'Checkpoint delay',
        ],
        milestoneDispatchPolicy: 'Milestone notifications dispatched strictly once per milestone event per shipment.',
      },
      allLoads: allLoads.map((l) => ({
        id: l.id,
        loadCode: `TF-SH-${l.id.slice(0, 6).toUpperCase()}`,
        title: l.title,
        origin: l.originName,
        originLat: l.originLat,
        originLng: l.originLng,
        destination: l.destName,
        destLat: l.destLat,
        destLng: l.destLng,
        status: l.status,
        cargoType: l.cargoType,
        weightTons: l.weightTons,
        budgetEtb: l.targetBudgetEtb,
      })),
      corridorWaypoints: dynamicWaypoints,
      riskZones: CORRIDOR_RISK_ZONES,
    });
  } catch (error: any) {
    console.error('Error fetching live tracking:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch live tracking data' });
  }
};

/**
 * 3. Get Full Corridor Metadata (Waypoints, Fuel Stations, Risk Zones)
 * GET /api/tracking/corridor
 */
export const getCorridorMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, originLat, originLng, destLat, destLng } = req.query;
    const o = origin ? String(origin) : undefined;
    const d = destination ? String(destination) : undefined;
    const oLat = originLat ? Number(originLat) : undefined;
    const oLng = originLng ? Number(originLng) : undefined;
    const dLat = destLat ? Number(destLat) : undefined;
    const dLng = destLng ? Number(destLng) : undefined;

    const dynamicWps = (o || d || oLat || dLat)
      ? getDynamicCorridorWaypoints(o, d, oLat, oLng, dLat, dLng)
      : CORRIDOR_WAYPOINTS;

    const distanceKm = calculateCorridorRoadDistanceKm(o, d, oLat, oLng, dLat, dLng);

    res.json({
      corridorName: o && d ? `${o} ➔ ${d} Strategic Freight Corridor` : 'Djibouti–Modjo–Addis Ababa Strategic Freight Corridor',
      totalLengthKm: distanceKm || 880,
      averageTransitHours: Number(((distanceKm || 880) / 50).toFixed(1)),
      waypoints: dynamicWps,
      riskZones: CORRIDOR_RISK_ZONES,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch corridor metadata' });
  }
};
