export {
  getPatient,
  updatePatient,
} from "./services/patient.service";

export {
  getMedicalDocuments,
  createMedicalDocument,
  downloadMedicalDocument,
  deleteMedicalDocument,
  MEDICAL_DOCUMENT_TYPES,
} from "./services/medical-record.service";

export type {
  MedicalDocument,
  MedicalDocumentType,
  CreateMedicalDocumentInput,
} from "./services/medical-record.service";

export type {
  Patient,
  PatientResponse,
  UpdatePatientInput,
} from "./services/patient.service";

export {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "./services/emergency-contact.service";

export type {
  EmergencyContact,
  EmergencyContactsResponse,
  EmergencyContactResponse,
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
} from "./services/emergency-contact.service";

export {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "./services/user-address.service";

export type {
  UserAddress,
  UserAddressesResponse,
  UserAddressResponse,
  CreateUserAddressInput,
  UpdateUserAddressInput,
} from "./services/user-address.service";
