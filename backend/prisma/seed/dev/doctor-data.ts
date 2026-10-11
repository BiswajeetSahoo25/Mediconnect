export type DoctorSeedData = {
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  about: string;
  consultationFee: number;
  consultationMode: string;
  password?: string;
};

export const doctorSeedData: DoctorSeedData[] = [
  {
    firstName: "Ananya",
    lastName: "Sharma",
    email: "ananya.sharma@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10001",
    specialization: "Cardiology",
    yearsOfExperience: 11,
    about:
      "Fictional cardiologist with experience in preventive cardiac care, hypertension management, and routine cardiovascular evaluation.",
    consultationFee: 900,
    consultationMode: "BOTH",
  },
  {
    firstName: "Maya",
    lastName: "Demo",
    email: "doctor.workspace@demo.mediconnect.test",
    password: "MediDocDemo@123",
    licenseNumber: "MC-FIC-10002",
    specialization: "Cardiology",
    yearsOfExperience: 8,
    about:
      "Fictional cardiologist profile for trying the MediConnect doctor workspace.",
    consultationFee: 800,
    consultationMode: "BOTH",
  },
];
