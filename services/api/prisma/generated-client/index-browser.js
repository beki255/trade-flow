
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  username: 'username',
  passwordHash: 'passwordHash',
  fullName: 'fullName',
  phone: 'phone',
  role: 'role',
  companyName: 'companyName',
  tin: 'tin',
  tradeLicenseNo: 'tradeLicenseNo',
  tradeLicenseDoc: 'tradeLicenseDoc',
  insuranceDoc: 'insuranceDoc',
  roadworthinessDoc: 'roadworthinessDoc',
  verificationStatus: 'verificationStatus',
  verificationNotes: 'verificationNotes',
  ratingAvg: 'ratingAvg',
  totalRatingsCount: 'totalRatingsCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VehicleScalarFieldEnum = {
  id: 'id',
  transporterId: 'transporterId',
  plateNumber: 'plateNumber',
  vehicleType: 'vehicleType',
  capacityTons: 'capacityTons',
  capacityVolumeCbm: 'capacityVolumeCbm',
  fuelType: 'fuelType',
  fuelEfficiencyBenchmarkKmL: 'fuelEfficiencyBenchmarkKmL',
  insurancePolicyNo: 'insurancePolicyNo',
  insuranceDocUrl: 'insuranceDocUrl',
  roadworthinessCertUrl: 'roadworthinessCertUrl',
  telematicsDeviceId: 'telematicsDeviceId',
  isAvailable: 'isAvailable',
  currentLat: 'currentLat',
  currentLng: 'currentLng',
  createdAt: 'createdAt'
};

exports.Prisma.DriverProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  assignedVehicleId: 'assignedVehicleId',
  driverLicenseNo: 'driverLicenseNo',
  licenseClass: 'licenseClass',
  experienceYears: 'experienceYears',
  safetyScore: 'safetyScore',
  isOnline: 'isOnline',
  createdAt: 'createdAt'
};

exports.Prisma.LoadScalarFieldEnum = {
  id: 'id',
  shipperId: 'shipperId',
  title: 'title',
  cargoType: 'cargoType',
  cargoDescription: 'cargoDescription',
  weightTons: 'weightTons',
  volumeCbm: 'volumeCbm',
  originName: 'originName',
  originLat: 'originLat',
  originLng: 'originLng',
  destName: 'destName',
  destLat: 'destLat',
  destLng: 'destLng',
  pickupWindowStart: 'pickupWindowStart',
  pickupWindowEnd: 'pickupWindowEnd',
  deliveryDeadline: 'deliveryDeadline',
  specialHandling: 'specialHandling',
  spotEstimatedPriceEtb: 'spotEstimatedPriceEtb',
  targetBudgetEtb: 'targetBudgetEtb',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BidScalarFieldEnum = {
  id: 'id',
  loadId: 'loadId',
  transporterId: 'transporterId',
  proposedRateEtb: 'proposedRateEtb',
  pickupEstimatedTime: 'pickupEstimatedTime',
  deliveryEstimatedTime: 'deliveryEstimatedTime',
  validityHours: 'validityHours',
  proposalNotes: 'proposalNotes',
  status: 'status',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.ShipmentScalarFieldEnum = {
  id: 'id',
  loadId: 'loadId',
  transporterId: 'transporterId',
  driverId: 'driverId',
  vehicleId: 'vehicleId',
  agreedRateEtb: 'agreedRateEtb',
  status: 'status',
  customsStatus: 'customsStatus',
  currentLat: 'currentLat',
  currentLng: 'currentLng',
  currentSpeedKmh: 'currentSpeedKmh',
  currentHeading: 'currentHeading',
  fuelLevelPct: 'fuelLevelPct',
  lastGpsUpdateTimestamp: 'lastGpsUpdateTimestamp',
  initialEtaTimestamp: 'initialEtaTimestamp',
  currentPredictedEta: 'currentPredictedEta',
  etaConfidenceMarginMins: 'etaConfidenceMarginMins',
  progressPercentage: 'progressPercentage',
  departedOriginAt: 'departedOriginAt',
  arrivedModjoAt: 'arrivedModjoAt',
  customsClearedAt: 'customsClearedAt',
  arrivedDestinationAt: 'arrivedDestinationAt',
  podSignatureUrl: 'podSignatureUrl',
  podPhotoUrl: 'podPhotoUrl',
  podRecipientName: 'podRecipientName',
  podDeliveredAt: 'podDeliveredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrackingEventScalarFieldEnum = {
  id: 'id',
  shipmentId: 'shipmentId',
  latitude: 'latitude',
  longitude: 'longitude',
  speedKmh: 'speedKmh',
  heading: 'heading',
  fuelLevelPct: 'fuelLevelPct',
  timestamp: 'timestamp',
  source: 'source'
};

exports.Prisma.RouteWaypointScalarFieldEnum = {
  id: 'id',
  name: 'name',
  nameAmharic: 'nameAmharic',
  lat: 'lat',
  lng: 'lng',
  sequenceOrder: 'sequenceOrder',
  isCustomsCheckpoint: 'isCustomsCheckpoint',
  isDryPort: 'isDryPort',
  isFuelStation: 'isFuelStation',
  fuelAvailable: 'fuelAvailable',
  dieselPricePerLiter: 'dieselPricePerLiter',
  congestionDelayMinutes: 'congestionDelayMinutes'
};

exports.Prisma.CustomsDocumentScalarFieldEnum = {
  id: 'id',
  shipmentId: 'shipmentId',
  docType: 'docType',
  docNumber: 'docNumber',
  fileUrl: 'fileUrl',
  fileName: 'fileName',
  fileSizeKb: 'fileSizeKb',
  declaredValueEtb: 'declaredValueEtb',
  issuingAuthority: 'issuingAuthority',
  issueDate: 'issueDate',
  validationPassed: 'validationPassed',
  validationErrors: 'validationErrors',
  clearanceStatus: 'clearanceStatus',
  officerNotes: 'officerNotes',
  reviewedByOfficerId: 'reviewedByOfficerId',
  reviewedAt: 'reviewedAt',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  shipmentId: 'shipmentId',
  shipperId: 'shipperId',
  transporterId: 'transporterId',
  grossAmountEtb: 'grossAmountEtb',
  platformCommissionRatePct: 'platformCommissionRatePct',
  platformCommissionEtb: 'platformCommissionEtb',
  netTransporterPayoutEtb: 'netTransporterPayoutEtb',
  paymentMethod: 'paymentMethod',
  telebirrTransactionNo: 'telebirrTransactionNo',
  telebirrPhone: 'telebirrPhone',
  status: 'status',
  disputeNotes: 'disputeNotes',
  paidAt: 'paidAt',
  settledAt: 'settledAt',
  createdAt: 'createdAt'
};

exports.Prisma.IncidentReportScalarFieldEnum = {
  id: 'id',
  reporterDriverId: 'reporterDriverId',
  shipmentId: 'shipmentId',
  category: 'category',
  severity: 'severity',
  description: 'description',
  latitude: 'latitude',
  longitude: 'longitude',
  locationName: 'locationName',
  photoUrl: 'photoUrl',
  isVerifiedByAuthority: 'isVerifiedByAuthority',
  createdAt: 'createdAt'
};

exports.Prisma.RatingScalarFieldEnum = {
  id: 'id',
  shipmentId: 'shipmentId',
  fromUserId: 'fromUserId',
  toUserId: 'toUserId',
  scoreStars: 'scoreStars',
  reviewText: 'reviewText',
  createdAt: 'createdAt'
};

exports.Prisma.PricingLogScalarFieldEnum = {
  id: 'id',
  corridorName: 'corridorName',
  baseDistanceKm: 'baseDistanceKm',
  baseCorridorRateEtb: 'baseCorridorRateEtb',
  demandRatio: 'demandRatio',
  fuelCostIndex: 'fuelCostIndex',
  congestionSurchargeEtb: 'congestionSurchargeEtb',
  calculatedSpotRateEtb: 'calculatedSpotRateEtb',
  floorBoundEtb: 'floorBoundEtb',
  ceilingBoundEtb: 'ceilingBoundEtb',
  finalRateEtb: 'finalRateEtb',
  timestamp: 'timestamp'
};

exports.Prisma.RiskZoneScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  severity: 'severity',
  centerLat: 'centerLat',
  centerLng: 'centerLng',
  radiusKm: 'radiusKm',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  SHIPPER: 'SHIPPER',
  TRANSPORTER: 'TRANSPORTER',
  DRIVER: 'DRIVER',
  FREIGHT_FORWARDER: 'FREIGHT_FORWARDER',
  CUSTOMS_OFFICER: 'CUSTOMS_OFFICER',
  ADMIN: 'ADMIN'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED'
};

exports.VehicleType = exports.$Enums.VehicleType = {
  FLATBED: 'FLATBED',
  CONTAINER_CARRIER: 'CONTAINER_CARRIER',
  BOX_TRUCK: 'BOX_TRUCK',
  TANKER: 'TANKER',
  REFRIGERATED: 'REFRIGERATED',
  LOWBED: 'LOWBED'
};

exports.FuelType = exports.$Enums.FuelType = {
  DIESEL: 'DIESEL',
  PETROL: 'PETROL',
  ELECTRIC: 'ELECTRIC'
};

exports.CargoType = exports.$Enums.CargoType = {
  CONTAINERIZED: 'CONTAINERIZED',
  AGRICULTURAL_COFFEE: 'AGRICULTURAL_COFFEE',
  GRAIN_BULK: 'GRAIN_BULK',
  INDUSTRIAL_MACHINERY: 'INDUSTRIAL_MACHINERY',
  TEXTILES_GARMENTS: 'TEXTILES_GARMENTS',
  CONSTRUCTION_MATERIALS: 'CONSTRUCTION_MATERIALS',
  PETROLEUM_FUEL: 'PETROLEUM_FUEL',
  PHARMACEUTICALS: 'PHARMACEUTICALS',
  GENERAL_MERCHANDISE: 'GENERAL_MERCHANDISE'
};

exports.LoadStatus = exports.$Enums.LoadStatus = {
  OPEN: 'OPEN',
  BIDDING: 'BIDDING',
  MATCHED: 'MATCHED',
  BOOKED: 'BOOKED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

exports.BidStatus = exports.$Enums.BidStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

exports.ShipmentStatus = exports.$Enums.ShipmentStatus = {
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  AT_ORIGIN: 'AT_ORIGIN',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_CUSTOMS: 'AT_CUSTOMS',
  CUSTOMS_CLEARED: 'CUSTOMS_CLEARED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

exports.CustomsClearanceStatus = exports.$Enums.CustomsClearanceStatus = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  CLEARED: 'CLEARED',
  REJECTED: 'REJECTED',
  REVISION_REQUESTED: 'REVISION_REQUESTED'
};

exports.CustomsDocType = exports.$Enums.CustomsDocType = {
  COMMERCIAL_INVOICE: 'COMMERCIAL_INVOICE',
  PACKING_LIST: 'PACKING_LIST',
  BILL_OF_LADING: 'BILL_OF_LADING',
  CERTIFICATE_OF_ORIGIN: 'CERTIFICATE_OF_ORIGIN',
  CUSTOMS_DECLARATION: 'CUSTOMS_DECLARATION',
  INSURANCE_CERTIFICATE: 'INSURANCE_CERTIFICATE'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  TELEBIRR: 'TELEBIRR',
  CBE_BIRR: 'CBE_BIRR',
  BANK_TRANSFER: 'BANK_TRANSFER',
  ESCROW: 'ESCROW'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  HELD_IN_ESCROW: 'HELD_IN_ESCROW',
  CONFIRMED: 'CONFIRMED',
  DISPUTED: 'DISPUTED',
  SETTLED: 'SETTLED',
  REFUNDED: 'REFUNDED'
};

exports.IncidentCategory = exports.$Enums.IncidentCategory = {
  ACCIDENT: 'ACCIDENT',
  ROAD_BLOCKAGE: 'ROAD_BLOCKAGE',
  CHECKPOINT_DELAY: 'CHECKPOINT_DELAY',
  FUEL_OUTAGE: 'FUEL_OUTAGE',
  SECURITY_CONCERN: 'SECURITY_CONCERN',
  MECHANICAL_BREAKDOWN: 'MECHANICAL_BREAKDOWN',
  SEVERE_WEATHER: 'SEVERE_WEATHER'
};

exports.RiskLevel = exports.$Enums.RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.Prisma.ModelName = {
  User: 'User',
  Vehicle: 'Vehicle',
  DriverProfile: 'DriverProfile',
  Load: 'Load',
  Bid: 'Bid',
  Shipment: 'Shipment',
  TrackingEvent: 'TrackingEvent',
  RouteWaypoint: 'RouteWaypoint',
  CustomsDocument: 'CustomsDocument',
  Payment: 'Payment',
  IncidentReport: 'IncidentReport',
  Rating: 'Rating',
  PricingLog: 'PricingLog',
  RiskZone: 'RiskZone'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
