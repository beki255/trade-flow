import {
  PrismaClient,
  UserRole,
  VerificationStatus,
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

  // 2. Seed Official Admin and Customs Accounts ONLY
  console.log('👤 Seeding System Administrator & Customs Officer Accounts ONLY...');

  // 2.1 Customs Officer (Inspector Kebede Worku)
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

  // 2.2 Administrator (Platform Admin)
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

  console.log('✅ TradeFlow Seeding Completed Successfully! System Administrator & Customs Officer Accounts are Ready.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
