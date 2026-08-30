import {
  PrismaClient,
  UserRole,
  VerificationStatus,
  VehicleType,
  FuelType,
  RiskLevel
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TradeFlow Demo Accounts & Corridor Seeding...');

  // 1. Clear previous seed data cleanly
  await prisma.pricingLog.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customsDocument.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.load.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.routeWaypoint.deleteMany();
  await prisma.riskZone.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Seed 6 Official Demo Accounts
  console.log('👤 Seeding 6 Official Demo Accounts...');

  // 2.1 Shipper (Dawit Tadesse)
  const shipper = await prisma.user.create({
    data: {
      email: 'dawit@miaoda.com',
      username: 'dawit',
      passwordHash: 'Demo1234!', // Plain for demo / bcrypt compatible
      fullName: 'Dawit Tadesse (Ethio Coffee Exporters)',
      phone: '+251911445566',
      role: UserRole.SHIPPER,
      companyName: 'Ethio Coffee Exporters PLC',
      tin: '0012938475',
      tradeLicenseNo: 'TL-AA-2024-8841',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.9,
      totalRatingsCount: 38,
    },
  });

  // 2.2 Transporter (Mulugeta Freight)
  const transporter = await prisma.user.create({
    data: {
      email: 'mulugeta@miaoda.com',
      username: 'mulugeta',
      passwordHash: 'Demo1234!',
      fullName: 'Mulugeta Freight Transport PLC',
      phone: '+251922334455',
      role: UserRole.TRANSPORTER,
      companyName: 'Mulugeta Heavy Logistics & Fleet',
      tin: '0098473621',
      tradeLicenseNo: 'TL-OR-2023-5512',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.8,
      totalRatingsCount: 92,
    },
  });

  // 2.3 Freight Forwarder (Sara Haile)
  const forwarder = await prisma.user.create({
    data: {
      email: 'sara@miaoda.com',
      username: 'sara',
      passwordHash: 'Demo1234!',
      fullName: 'Sara Haile (Red Sea Forwarding)',
      phone: '+251933445566',
      role: UserRole.FREIGHT_FORWARDER,
      companyName: 'Red Sea International Freight Forwarders',
      tin: '0047281934',
      tradeLicenseNo: 'TL-AA-2022-9901',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 5.0,
      totalRatingsCount: 14,
    },
  });

  // 2.4 Customs Officer (Inspector Kebede Worku)
  const customs = await prisma.user.create({
    data: {
      email: 'kebede@miaoda.com',
      username: 'kebede',
      passwordHash: 'Demo1234!',
      fullName: 'Inspector Kebede Worku',
      phone: '+251944556677',
      role: UserRole.CUSTOMS_OFFICER,
      companyName: 'Ethiopian Customs Commission (ECC)',
      tin: 'GOV-ECC-4482',
      tradeLicenseNo: 'ECC-OFFICER-77',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 5.0,
      totalRatingsCount: 1,
    },
  });

  // 2.5 Administrator (Platform Admin)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@miaoda.com',
      username: 'admin',
      passwordHash: 'Admin2024!',
      fullName: 'TradeFlow System Administrator',
      phone: '+251900000001',
      role: UserRole.ADMIN,
      companyName: 'TradeFlow Platform Management',
      tin: 'TF-ADMIN-0001',
      tradeLicenseNo: 'TF-HQ-2026',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 5.0,
      totalRatingsCount: 1,
    },
  });

  // 2.6 Driver User & Profile (Abebe Bikila)
  const driverUser = await prisma.user.create({
    data: {
      email: 'driver@tradeflow.et',
      username: 'driver',
      passwordHash: 'Demo1234!',
      fullName: 'Abebe Bikila (Senior Heavy Truck Driver)',
      phone: '+251911223344',
      role: UserRole.DRIVER,
      companyName: 'Mulugeta Freight Transport PLC',
      tin: 'DRV-ETH-9921',
      tradeLicenseNo: 'LIC-CAT-5-8832',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.95,
      totalRatingsCount: 64,
    },
  });

  // 3. Seed Transporter Fleet Vehicles
  console.log('🚛 Seeding Transporter Fleet Vehicles...');
  const vehicle1 = await prisma.vehicle.create({
    data: {
      transporterId: transporter.id,
      plateNumber: '3-AA-78901',
      vehicleType: VehicleType.CONTAINER_CARRIER,
      capacityTons: 32.0,
      capacityVolumeCbm: 65.0,
      fuelType: FuelType.DIESEL,
      fuelEfficiencyBenchmarkKmL: 3.4,
      insurancePolicyNo: 'POL-NIC-2026-9921',
      isAvailable: true,
      currentLat: 11.5886,
      currentLng: 43.1456,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      transporterId: transporter.id,
      plateNumber: '3-ET-11234',
      vehicleType: VehicleType.FLATBED,
      capacityTons: 40.0,
      capacityVolumeCbm: 80.0,
      fuelType: FuelType.DIESEL,
      fuelEfficiencyBenchmarkKmL: 3.2,
      insurancePolicyNo: 'POL-EIC-2026-3341',
      isAvailable: true,
      currentLat: 8.5911,
      currentLng: 39.1235,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      transporterId: transporter.id,
      plateNumber: '3-OR-55421',
      vehicleType: VehicleType.BOX_TRUCK,
      capacityTons: 15.0,
      capacityVolumeCbm: 45.0,
      fuelType: FuelType.DIESEL,
      fuelEfficiencyBenchmarkKmL: 4.1,
      insurancePolicyNo: 'POL-NIC-2026-1188',
      isAvailable: true,
      currentLat: 8.9056,
      currentLng: 38.7619,
    },
  });

  // 4. Link Driver Profile to Vehicle 1
  await prisma.driverProfile.create({
    data: {
      userId: driverUser.id,
      assignedVehicleId: vehicle1.id,
      driverLicenseNo: 'DL-ETH-992144',
      licenseClass: 'Heavy Truck (Grade 5)',
      experienceYears: 9,
      safetyScore: 98.0,
      isOnline: true,
    },
  });

  // 5. Seed 8 Corridor Highway Waypoints
  console.log('📍 Seeding Corridor Highway Checkpoints (Djibouti ➔ Modjo ➔ Addis Ababa)...');
  const waypoints = [
    {
      name: 'Djibouti Port (Doraleh Container Terminal)',
      nameAmharic: 'የጅቡቲ ወደብ (ዶራሌ ኮንቴይነር ተርሚናል)',
      lat: 11.5886,
      lng: 43.1456,
      sequenceOrder: 1,
      isCustomsCheckpoint: true,
      isDryPort: false,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 110.0,
      congestionDelayMinutes: 45,
    },
    {
      name: 'Galafi Border Customs Checkpoint',
      nameAmharic: 'የገላፊ ድንበር ጉምሩክ ኬላ',
      lat: 11.7167,
      lng: 41.8333,
      sequenceOrder: 2,
      isCustomsCheckpoint: true,
      isDryPort: false,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 98.5,
      congestionDelayMinutes: 90,
    },
    {
      name: 'Semera Regional Logistics Hub',
      nameAmharic: 'የሰመራ የሎጅስቲክስ ማዕከል',
      lat: 11.7936,
      lng: 41.0084,
      sequenceOrder: 3,
      isCustomsCheckpoint: false,
      isDryPort: false,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 95.0,
      congestionDelayMinutes: 15,
    },
    {
      name: 'Mille Junction & Fuel Depot',
      nameAmharic: 'የሚሌ መገናኛ እና ነዳጅ ዲፖ',
      lat: 11.4167,
      lng: 40.7500,
      sequenceOrder: 4,
      isCustomsCheckpoint: false,
      isDryPort: false,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 94.0,
      congestionDelayMinutes: 20,
    },
    {
      name: 'Awash 7 Kilo Toll & Inspection Gate',
      nameAmharic: 'የአዋሽ 7 ኪሎ የፍተሻ ጣቢያ',
      lat: 8.9833,
      lng: 40.1667,
      sequenceOrder: 5,
      isCustomsCheckpoint: true,
      isDryPort: false,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 92.5,
      congestionDelayMinutes: 30,
    },
    {
      name: 'Adama Expressway Interchange',
      nameAmharic: 'የአዳማ የፍጥነት መንገድ መግቢያ',
      lat: 8.5400,
      lng: 39.2700,
      sequenceOrder: 6,
      isCustomsCheckpoint: false,
      isDryPort: false,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 92.0,
      congestionDelayMinutes: 15,
    },
    {
      name: 'Modjo Dry Port & Multimodal Terminal',
      nameAmharic: 'የሞጆ ደረቅ ወደብ እና የጉምሩክ ተርሚናል',
      lat: 8.5911,
      lng: 39.1235,
      sequenceOrder: 7,
      isCustomsCheckpoint: true,
      isDryPort: true,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 92.0,
      congestionDelayMinutes: 120,
    },
    {
      name: 'Addis Ababa (Kaliti Freight & Customs Terminal)',
      nameAmharic: 'አዲስ አበባ (ቃሊቲ የጭነትና ጉምሩክ ተርሚናል)',
      lat: 8.9056,
      lng: 38.7619,
      sequenceOrder: 8,
      isCustomsCheckpoint: true,
      isDryPort: true,
      isFuelStation: true,
      fuelAvailable: true,
      dieselPricePerLiter: 92.0,
      congestionDelayMinutes: 30,
    },
  ];

  for (const wp of waypoints) {
    await prisma.routeWaypoint.create({ data: wp });
  }

  // 6. Seed Corridor Risk Zone Alerts
  console.log('⚠️ Seeding Corridor Security Risk Zones...');
  await prisma.riskZone.create({
    data: {
      name: 'Awash Gorge Heavy Rain & Landslide Alert Zone',
      description: 'Seasonal heavy rains causing slow traffic and slippery asphalt along Awash Gorge leg.',
      severity: RiskLevel.MEDIUM,
      centerLat: 8.9950,
      centerLng: 40.1800,
      radiusKm: 18.0,
      isActive: true,
    },
  });

  console.log('✅ TradeFlow Seeding Completed Successfully! All 6 Demo Accounts & Waypoints are Ready.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
