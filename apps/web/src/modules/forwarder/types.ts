export interface ForwarderStats {
  activeClients: number;
  totalLoadsManaged: number;
  activeLoadsManaged: number;
  averageSavingsPct: number;
}

export interface ClientLoadSummary {
  id: string;
  loadCode: string;
  title: string;
  weightTons: number;
  route: string;
  status: string;
}

export interface ForwarderClientItem {
  id: string;
  fullName: string;
  companyName: string;
  tin: string;
  phone: string;
  email: string;
  totalLoadsCount: number;
  activeLoadsCount: number;
  totalTonnageManaged: number;
  verificationStatus: string;
  recentLoads: ClientLoadSummary[];
}

export interface LtlLoadItem {
  id: string;
  loadCode: string;
  title: string;
  cargoType: string;
  weightTons: number;
  volumeCbm: number;
  origin: string;
  destination: string;
  targetBudgetEtb: number;
  shipperName: string;
  shipperCompany: string;
  shipperTin: string;
  status: string;
  pickupWindowStart: string;
  isEligibleForConsolidation: boolean;
}

export interface SubConsignmentItem {
  id: string;
  code: string;
  shipperCompany: string;
  cargo: string;
  weightTons: number;
}

export interface ConsolidationDossier {
  masterLoadId: string;
  containerCode: string;
  containerType: string;
  masterTitle: string;
  origin: string;
  destination: string;
  consignmentsCount: number;
  totalWeightTons: number;
  totalVolumeCbm: number;
  weightUtilizationPct: number;
  volumeUtilizationPct: number;
  separateShipmentCost: number;
  consolidatedCost: number;
  totalSavingsEtb: number;
  savingsPct: number;
  subConsignments: SubConsignmentItem[];
  createdAt: string;
}

export interface MultimodalContainerItem {
  id: string;
  containerNo: string;
  shipmentId: string;
  consignmentCode: string;
  title: string;
  cargoType: string;
  weightTons: number;
  route: string;
  carrier: string;
  currentLeg: number;
  legLabel: string;
  estimatedArrival: string;
  customsStatus: string;
  status: string;
}
