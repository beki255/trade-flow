// packages/shared/src/corridor.ts
// Single Source of Truth for Ethiopia-Djibouti Trade Corridor

export interface CorridorTelemetry {
  truckId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  cargoType: string;
  cargoWeightTons: number;
  origin: string;
  destination: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'AT_CHECKPOINT' | 'CUSTOMS_HOLD' | 'DELIVERED' | 'DELAYED';
  speedKmH: number;
  latitude: number;
  longitude: number;
  heading: number;
  fuelLevelPercent: number;
  lastUpdated: string;
  etaHours: number;
  currentCheckpoint: string;
}

export interface Waypoint {
  id: string;
  name: string;
  nameAm: string;
  latitude: number;
  longitude: number;
  type: 'ORIGIN' | 'TOLL_GATE' | 'PARKING' | 'SCALE_CHECK' | 'BORDER_CUSTOMS' | 'DESTINATION';
  description: string;
  averageWaitTimeMins: number;
}

export const CORRIDOR_WAYPOINTS: Waypoint[] = [
  {
    id: 'WP-1',
    name: 'Addis Ababa (Kaliti Dispatch Terminal)',
    nameAm: 'አዲስ አበባ (ቃሊቲ የመነሻ ተርሚናል)',
    latitude: 9.005401,
    longitude: 38.763611,
    type: 'ORIGIN',
    description: 'Primary Ethiopian manufacturing and dispatch center.',
    averageWaitTimeMins: 45,
  },
  {
    id: 'WP-2',
    name: 'Modjo Dry Port & Toll Plaza',
    nameAm: 'ሞጆ ደረቅ ወደብ እና የክፍያ ጣቢያ',
    latitude: 8.591234,
    longitude: 39.121543,
    type: 'TOLL_GATE',
    description: 'Major inland dry port and expressway toll junction.',
    averageWaitTimeMins: 30,
  },
  {
    id: 'WP-3',
    name: 'Awash Arba Safe Rest & Fuel Stop',
    nameAm: 'አዋሽ አርባ ማረፊያ እና የነዳጅ ማደያ',
    latitude: 9.143891,
    longitude: 40.165432,
    type: 'PARKING',
    description: 'Designated heavy-duty rest stop with security and repair services.',
    averageWaitTimeMins: 20,
  },
  {
    id: 'WP-4',
    name: 'Semera Weighbridge & Electronic Seal Check',
    nameAm: 'ሰመራ የጭነት ሚዛን እና የኤሌክትሮኒክ ማህተም ኬላ',
    latitude: 11.794321,
    longitude: 41.008765,
    type: 'SCALE_CHECK',
    description: 'Afar Regional hub with electronic cargo seal scanners and weighbridges.',
    averageWaitTimeMins: 35,
  },
  {
    id: 'WP-5',
    name: 'Galafi Border Customs (Ethiopia–Djibouti)',
    nameAm: 'ገላፊ የድንበር ጉምሩክ ኬላ (ኢትዮጵያ–ጅቡቲ)',
    latitude: 11.758920,
    longitude: 41.834190,
    type: 'BORDER_CUSTOMS',
    description: 'Single-window bilateral customs inspection and clearance station.',
    averageWaitTimeMins: 60,
  },
  {
    id: 'WP-6',
    name: 'Djibouti Port (Container & Bulk Terminal)',
    nameAm: 'የጅቡቲ ወደብ (የኮንቴይነር እና የጅምላ ጭነት ተርሚናል)',
    latitude: 11.595012,
    longitude: 43.148021,
    type: 'DESTINATION',
    description: 'Deepwater sea terminal connecting Ethiopian trade to global shipping lanes.',
    averageWaitTimeMins: 90,
  },
];

/**
 * Standard Demo Accounts with database-matched passwords
 */
export const DEMO_ACCOUNTS = {
  SHIPPER: {
    email: 'dawit@miaoda.com',
    password: 'Demo1234!',
    username: 'dawit',
    fullName: 'Dawit Tadesse (Ethio Coffee Exporters)',
    role: 'SHIPPER',
    tin: '0012938475',
    tradeLicenseNo: 'TL-AA-2024-8841',
  },
  TRANSPORTER: {
    email: 'mulugeta@miaoda.com',
    password: 'Demo1234!',
    username: 'mulugeta',
    fullName: 'Mulugeta Freight Transport PLC',
    role: 'TRANSPORTER',
    tin: '0098473621',
    tradeLicenseNo: 'TL-OR-2023-5512',
  },
  FORWARDER: {
    email: 'sara@miaoda.com',
    password: 'Demo1234!',
    username: 'sara',
    fullName: 'Sara Haile (Red Sea Forwarding)',
    role: 'FREIGHT_FORWARDER',
    tin: '0047281934',
    tradeLicenseNo: 'TL-AA-2022-9901',
  },
  CUSTOMS: {
    email: 'kebede@miaoda.com',
    password: 'Demo1234!',
    username: 'kebede',
    fullName: 'Inspector Kebede Worku',
    role: 'CUSTOMS_OFFICER',
    tin: 'GOV-ECC-4482',
    tradeLicenseNo: 'ECC-OFFICER-77',
  },
  ADMIN: {
    email: 'admin@miaoda.com',
    password: 'Admin2024!',
    username: 'admin',
    fullName: 'TradeFlow System Administrator',
    role: 'ADMIN',
    tin: 'TF-ADMIN-0001',
    tradeLicenseNo: 'TF-HQ-2026',
  },
  DRIVER: {
    email: 'driver@tradeflow.et',
    password: 'Demo1234!',
    username: 'driver',
    fullName: 'Abebe Bikila (Senior Heavy Truck Driver)',
    role: 'DRIVER',
    tin: 'DRV-ETH-9921',
    tradeLicenseNo: 'LIC-CAT-5-8832',
  },
};
