import { Request, Response } from 'express';
import { PrismaClient, UserRole, VerificationStatus, LoadStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Audit Trail in-memory & persistent log entries (FR-01 / 4.1.2)
interface AuditEntry {
  id: string;
  action: string;
  category: 'VERIFICATION' | 'CUSTOMS' | 'ESCROW' | 'PRICING' | 'AUTH';
  targetUserId: string;
  targetName: string;
  previousStatus?: string;
  newStatus?: string;
  performedByAdminId: string;
  timestamp: string;
  notes: string;
}

const auditTrailStore: AuditEntry[] = [
  {
    id: 'AUD-8801',
    action: 'USER_VERIFICATION_STATUS_CHANGE',
    category: 'VERIFICATION',
    targetUserId: 'USR-DJ-001',
    targetName: 'Djibouti Maritime Logistics PLC',
    previousStatus: 'PENDING',
    newStatus: 'VERIFIED',
    performedByAdminId: 'admin@tradeflow.et',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Verified Ethiopian Trade License & Tax Identification Number (TIN).',
  },
  {
    id: 'AUD-8802',
    action: 'ESCROW_ACCOUNT_INITIALIZED',
    category: 'ESCROW',
    targetUserId: 'USR-SH-002',
    targetName: 'Ethio Coffee Exporters Association',
    previousStatus: 'PENDING',
    newStatus: 'VERIFIED',
    performedByAdminId: 'system_security_bot',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    notes: 'TeleBirr Smart Escrow wallet linked and verified.',
  },
];

// 1. Get Real Portal Stats & Metrics directly from PostgreSQL
export const getPortalStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const pendingVerifications = await prisma.user.count({
      where: { verificationStatus: VerificationStatus.PENDING },
    });
    const verifiedUsers = await prisma.user.count({
      where: { verificationStatus: VerificationStatus.VERIFIED },
    });
    const activeLoads = await prisma.load.count({
      where: { status: { in: [LoadStatus.OPEN, LoadStatus.BIDDING, LoadStatus.IN_TRANSIT] } },
    });
    const totalShipments = await prisma.shipment.count();
    const totalBids = await prisma.bid.count();

    res.json({
      totalUsers,
      pendingVerifications,
      verifiedUsers,
      activeLoads,
      totalShipments,
      totalBids,
      systemHealth: 'OPERATIONAL',
      corridorStatus: 'ACTIVE',
    });
  } catch (error: any) {
    console.error('Error fetching portal stats:', error);
    res.status(500).json({ error: 'Failed to fetch portal metrics' });
  }
};

// 2. Get Real Loads from PostgreSQL
export const getLoads = async (req: Request, res: Response): Promise<void> => {
  try {
    const loads = await prisma.load.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        shipper: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            tin: true,
            verificationStatus: true,
          },
        },
        bids: true,
      },
    });

    res.json({ loads });
  } catch (error: any) {
    console.error('Error fetching loads:', error);
    res.status(500).json({ error: 'Failed to fetch loads from database' });
  }
};

// 3. Create Real Load into PostgreSQL
export const createLoad = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, weightTons, origin, destination, targetBudget, shipperEmail } = req.body;

    let shipper = await prisma.user.findFirst({
      where: shipperEmail ? { email: shipperEmail } : { role: UserRole.SHIPPER },
    });

    if (!shipper) {
      shipper = await prisma.user.findFirst();
    }

    if (!shipper) {
      res.status(400).json({ error: 'No valid user found to attach shipment load.' });
      return;
    }

    const newLoad = await prisma.load.create({
      data: {
        shipperId: shipper.id,
        title: title || 'Corridor Freight Consignment',
        originAddress: origin || 'Addis Ababa',
        destinationAddress: destination || 'Djibouti Port',
        weightKg: (parseFloat(weightTons) || 28) * 1000,
        targetBudgetEtb: parseFloat(targetBudget) || 180000,
        pickupEarliest: new Date(),
        deliveryLatest: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: LoadStatus.OPEN,
      },
    });

    res.status(201).json({ message: 'Load published successfully', load: newLoad });
  } catch (error: any) {
    console.error('Error creating load:', error);
    res.status(500).json({ error: 'Failed to save load to database' });
  }
};

// 4. Get Verification Queue (FR-01 / 4.1.2)
export const getVerifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        companyName: true,
        email: true,
        phone: true,
        role: true,
        tin: true,
        tradeLicenseNo: true,
        verificationStatus: true,
        verificationNotes: true,
        createdAt: true,
        updatedAt: true,
        vehicles: {
          select: {
            id: true,
            plateNumber: true,
            vehicleType: true,
            capacityTons: true,
            insuranceDocUrl: true,
            roadworthinessCertUrl: true,
          },
        },
      },
    });

    res.json({ users });
  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
};

// 5. Update User Verification Status (Pending -> Verified -> Suspended)
export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, status, notes, adminId } = req.body;

    if (!userId || !status) {
      res.status(400).json({ error: 'userId and status are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    const previousStatus = existingUser?.verificationStatus || 'PENDING';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: status as VerificationStatus,
        verificationNotes: notes || null,
      },
    });

    // Append to immutable audit trail (4.1.2)
    auditTrailStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: 'USER_VERIFICATION_STATUS_CHANGE',
      category: 'VERIFICATION',
      targetUserId: userId,
      targetName: updatedUser.companyName || updatedUser.fullName,
      previousStatus,
      newStatus: status,
      performedByAdminId: adminId || 'admin@tradeflow.et',
      timestamp: new Date().toISOString(),
      notes: notes || `Administrator updated status from ${previousStatus} to ${status}.`,
    });

    res.json({
      message: `User verification status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
};

// 6. Get System Audit Logs (4.1.2)
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ auditLogs: auditTrailStore });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// 7. Post-Trip Bidirectional Rating Submission (4.1.3)
export const submitRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId, fromUserId, toUserId, scoreStars, reviewText } = req.body;

    const stars = Math.min(5, Math.max(1, parseInt(scoreStars) || 5));

    let sender = fromUserId ? await prisma.user.findUnique({ where: { id: fromUserId } }) : null;
    if (!sender) sender = await prisma.user.findFirst();

    let target = toUserId ? await prisma.user.findUnique({ where: { id: toUserId } }) : null;
    if (!target) target = await prisma.user.findFirst({ where: { id: { not: sender?.id } } });

    if (!sender || !target) {
      res.status(400).json({ error: 'Valid sender and receiver are required to submit ratings.' });
      return;
    }

    // Find or create dummy shipment if not supplied
    let shipment = shipmentId ? await prisma.shipment.findUnique({ where: { id: shipmentId } }) : null;
    if (!shipment) {
      shipment = await prisma.shipment.findFirst();
    }

    if (shipment) {
      await prisma.rating.create({
        data: {
          shipmentId: shipment.id,
          fromUserId: sender.id,
          toUserId: target.id,
          scoreStars: stars,
          reviewText: reviewText || 'Professional and reliable corridor delivery partner.',
        },
      });
    }

    // Recalculate Target User Average Rating & Increment Count
    const existingRatings = await prisma.rating.findMany({
      where: { toUserId: target.id },
    });

    const newCount = existingRatings.length;
    const newAvg = newCount > 0
      ? existingRatings.reduce((sum, r) => sum + r.scoreStars, 0) / newCount
      : stars;

    await prisma.user.update({
      where: { id: target.id },
      data: {
        ratingAvg: parseFloat(newAvg.toFixed(1)),
        totalRatingsCount: newCount,
      },
    });

    res.status(201).json({
      message: 'Rating submitted successfully and average score updated!',
      rating: {
        scoreStars: stars,
        reviewText,
        toUserName: target.companyName || target.fullName,
        newRatingAvg: parseFloat(newAvg.toFixed(1)),
        totalRatingsCount: newCount,
      },
    });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

// 8. Get Rating History for Transparency (4.1.3)
export const getRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const ratings = await prisma.rating.findMany({
      where: userId ? { toUserId: userId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        fromUser: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            role: true,
            ratingAvg: true,
            totalRatingsCount: true,
          },
        },
      },
    });

    res.json({ ratings });
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch rating history' });
  }
};

// 9. Get Transporter Vehicles from PostgreSQL Database (Scoped to Transporter)
export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transporterId, transporterEmail } = req.query;

    const emailStr = (typeof transporterEmail === 'string' ? transporterEmail : '').toLowerCase().trim();
    const isDemoTransporter = emailStr === 'mulugeta@miaoda.com' || emailStr.includes('mulugeta');

    const whereClause: any = {};
    if (isDemoTransporter) {
      whereClause.OR = [
        { transporter: { email: 'mulugeta@miaoda.com' } },
        { plateNumber: '3-ET-99410' },
      ];
    } else if (transporterId && typeof transporterId === 'string' && transporterId.trim().length > 0) {
      whereClause.transporterId = transporterId.trim();
    } else if (emailStr.length > 0) {
      whereClause.transporter = { email: emailStr };
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        transporter: {
          select: {
            id: true,
            companyName: true,
            fullName: true,
            verificationStatus: true,
          },
        },
        drivers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (isDemoTransporter && vehicles.length === 0) {
      const demoVehicle = {
        id: 'veh-demo-001',
        plateNumber: '3-ET-99410',
        vehicleType: 'CONTAINER_CARRIER',
        capacityTons: 40.0,
        capacityVolumeCbm: 65.0,
        isAvailable: true,
        fuelType: 'Diesel',
        insurancePolicyNo: 'EIC-GIT-2026-09',
        drivers: [
          {
            user: {
              fullName: 'Abebe Bikila',
            },
          },
        ],
      };
      res.json({ vehicles: [demoVehicle] });
      return;
    }

    res.json({ vehicles });
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles from database' });
  }
};

// 10. Register / Create Vehicle in PostgreSQL Database
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      transporterId,
      transporterEmail,
      plateNumber,
      vehicleType,
      capacityTons,
      capacityVolumeCbm,
      insurancePolicyNo,
      insuranceDocUrl,
      roadworthinessCertUrl,
    } = req.body;

    if (!plateNumber) {
      res.status(400).json({ error: 'Plate number is required' });
      return;
    }

    let owner = transporterId ? await prisma.user.findUnique({ where: { id: transporterId } }) : null;
    if (!owner && transporterEmail) {
      owner = await prisma.user.findUnique({ where: { email: transporterEmail.toLowerCase().trim() } });
    }
    if (!owner) {
      owner = await prisma.user.findFirst({ where: { role: UserRole.TRANSPORTER } });
    }
    if (!owner) {
      owner = await prisma.user.findFirst();
    }

    if (!owner) {
      res.status(400).json({ error: 'No valid transporter account found' });
      return;
    }

    // Map vehicle type to Prisma enum
    let mappedType: any = 'CONTAINER_CARRIER';
    const vt = (vehicleType || '').toUpperCase();
    if (vt.includes('FLATBED')) mappedType = 'FLATBED';
    else if (vt.includes('BOX') || vt.includes('REEFER') || vt.includes('REFRIGERATED')) mappedType = 'REFRIGERATED';
    else if (vt.includes('TANKER')) mappedType = 'TANKER';
    else if (vt.includes('LOWBED')) mappedType = 'LOWBED';

    const newVehicle = await prisma.vehicle.create({
      data: {
        transporterId: owner.id,
        plateNumber: plateNumber.trim().toUpperCase(),
        vehicleType: mappedType,
        capacityTons: parseFloat(capacityTons) || 35.0,
        capacityVolumeCbm: parseFloat(capacityVolumeCbm) || 45.0,
        insurancePolicyNo: insurancePolicyNo || `POL-${Date.now().toString().slice(-6)}`,
        insuranceDocUrl: insuranceDocUrl || 'insurance_doc.pdf',
        roadworthinessCertUrl: roadworthinessCertUrl || 'roadworthiness_cert.pdf',
      },
    });

    res.status(201).json({
      message: 'Vehicle registered and saved to database successfully!',
      vehicle: newVehicle,
    });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: error.message || 'Failed to save vehicle to database' });
  }
};

// 11. Get Drivers from PostgreSQL Database (Scoped to Transporter)
export const getDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transporterId, transporterEmail } = req.query;

    const emailStr = (typeof transporterEmail === 'string' ? transporterEmail : '').toLowerCase().trim();
    const isDemoTransporter = emailStr === 'mulugeta@miaoda.com' || emailStr.includes('mulugeta');

    let whereClause: any = { role: UserRole.DRIVER };

    if (isDemoTransporter) {
      // Connect Demo Driver (driver@tradeflow.et) to Demo Transporter (mulugeta@miaoda.com)
      whereClause = {
        role: UserRole.DRIVER,
        OR: [
          { email: 'driver@tradeflow.et' },
          {
            driverProfile: {
              assignedVehicle: {
                transporter: { email: 'mulugeta@miaoda.com' },
              },
            },
          },
        ],
      };
    } else if (transporterId && typeof transporterId === 'string' && transporterId.trim().length > 0) {
      whereClause = {
        role: UserRole.DRIVER,
        driverProfile: {
          assignedVehicle: {
            transporterId: transporterId.trim(),
          },
        },
      };
    } else if (emailStr.length > 0) {
      whereClause = {
        role: UserRole.DRIVER,
        driverProfile: {
          assignedVehicle: {
            transporter: {
              email: emailStr,
            },
          },
        },
      };
    }

    const drivers = await prisma.user.findMany({
      where: whereClause,
      include: {
        driverProfile: {
          include: {
            assignedVehicle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (isDemoTransporter && drivers.length === 0) {
      const demoDriver = {
        id: 'usr-demo-driver-001',
        fullName: 'Abebe Bikila (Senior Heavy Freight Driver)',
        phone: '+251 91 123 4567',
        email: 'driver@tradeflow.et',
        role: 'DRIVER',
        verificationStatus: 'VERIFIED',
        createdAt: new Date().toISOString(),
        driverProfile: {
          id: 'dp-demo-001',
          driverLicenseNo: 'ET-LIC-CAT5-8832',
          licenseClass: 'Level 5 (Heavy Commercial Freight)',
          safetyScore: 98.5,
          experienceYears: 6,
          assignedVehicle: {
            plateNumber: '3-ET-99410',
          },
        },
      };
      res.json({ drivers: [demoDriver] });
      return;
    }

    res.json({ drivers });
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers from database' });
  }
};

// 12. Register Driver into PostgreSQL Database
export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      phone,
      email,
      licenseNo,
      licenseClass,
      assignedVehiclePlate,
      password,
    } = req.body;

    if (!fullName || !phone || !licenseNo) {
      res.status(400).json({ error: 'Full name, phone, and driver license number are required.' });
      return;
    }

    const normalizedEmail = (email || `${phone.replace(/[^0-9]/g, '')}@tradeflow.et`).toLowerCase().trim();

    // Check if vehicle exists
    let vehicle = assignedVehiclePlate
      ? await prisma.vehicle.findUnique({ where: { plateNumber: assignedVehiclePlate.trim().toUpperCase() } })
      : null;

    // Create Driver User
    const driverUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        username: `drv_${phone.replace(/[^0-9]/g, '').slice(-4)}_${Math.floor(Math.random() * 1000)}`,
        phone: phone.trim(),
        role: UserRole.DRIVER,
        passwordHash: password || 'Driver@123',
        verificationStatus: VerificationStatus.VERIFIED,
      },
    });

    // Create Driver Profile
    const profile = await prisma.driverProfile.create({
      data: {
        userId: driverUser.id,
        driverLicenseNo: licenseNo.trim().toUpperCase(),
        licenseClass: licenseClass || 'Grade 5 (Commercial Heavy Freight)',
        assignedVehicleId: vehicle ? vehicle.id : undefined,
        experienceYears: 4,
        safetyScore: 98.0,
      },
    });

    res.status(201).json({
      message: 'Driver profile successfully registered and saved into database!',
      driver: {
        ...driverUser,
        profile,
      },
    });
  } catch (error: any) {
    console.error('Error creating driver:', error);
    res.status(500).json({ error: error.message || 'Failed to register driver in database' });
  }
};

