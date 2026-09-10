export interface MedicinePreview {
  id: string;
  name: string | undefined;
  genericName?: string;
  manufacturer?: string;
  dosageForm?: string;
  route?: string;
  source: string;
}

export interface MedicineDetail extends MedicinePreview {
  activeIngredients?: string[];
  indications?: string;
  dosageAndAdministration?: string;
  warnings?: string;
  contraindications?: string;
  adverseReactions?: string;
  drugInteractions?: string;
  doNotUse?: string;
  askDoctor?: string;
  askDoctorOrPharmacist?: string;
  stopUse?: string;
  pregnancyOrBreastfeeding?: string;
  keepOutOfReachOfChildren?: string;
  storageAndHandling?: string;
  inactiveIngredients?: string[];
  brandName?: string;
  productNdc?: string;
  splId?: string;
  splSetId?: string;
  pharmClassMoa?: string;
  pharmClassPe?: string;
  pharmClassCs?: string;
  productType?: string;
  principalDisplayPanel?: string;
}

export interface MedicineListResponse {
  success: boolean;
  data: MedicinePreview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
