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
  facilityName: string;
  availability: Array<{
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
  }>;
  password?: string;
};

const weekdayMorning = [{ daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "13:00" }];

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
    facilityName: "MediConnect Central Hospital",
    availability: weekdayMorning,
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
    facilityName: "MediConnect City Clinic",
    availability: weekdayMorning,
  },
  {
    firstName: "Kavya",
    lastName: "Menon",
    email: "kavya.menon@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10003",
    specialization: "Dermatology",
    yearsOfExperience: 9,
    about: "Fictional dermatologist focused on common skin conditions, acne care, and preventive skin health.",
    consultationFee: 650,
    consultationMode: "BOTH",
    facilityName: "MediConnect City Clinic",
    availability: [
      { daysOfWeek: [1, 2, 3, 4, 5], startTime: "10:00", endTime: "14:00" },
      { daysOfWeek: [6], startTime: "10:00", endTime: "13:00" },
    ],
  },
  {
    firstName: "Arjun",
    lastName: "Rao",
    email: "arjun.rao@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10004",
    specialization: "Pediatrics",
    yearsOfExperience: 12,
    about: "Fictional pediatrician providing routine child health visits, preventive care, and family guidance.",
    consultationFee: 750,
    consultationMode: "IN_PERSON",
    facilityName: "MediConnect Central Hospital",
    availability: [
      { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "15:00" },
    ],
  },
  {
    firstName: "Nisha",
    lastName: "Iyer",
    email: "nisha.iyer@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10005",
    specialization: "Gynecology",
    yearsOfExperience: 14,
    about: "Fictional gynecologist focused on preventive reproductive health and routine women's health consultations.",
    consultationFee: 1100,
    consultationMode: "BOTH",
    facilityName: "MediConnect City Clinic",
    availability: [
      { daysOfWeek: [1, 3, 5], startTime: "12:00", endTime: "18:00" },
      { daysOfWeek: [2, 4], startTime: "09:00", endTime: "13:00" },
    ],
  },
  {
    firstName: "Rohan",
    lastName: "Mehta",
    email: "rohan.mehta@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10006",
    specialization: "Orthopedics",
    yearsOfExperience: 16,
    about: "Fictional orthopedic specialist providing evaluation for joint, bone, and sports-related conditions.",
    consultationFee: 1000,
    consultationMode: "BOTH",
    facilityName: "MediConnect Central Hospital",
    availability: [
      { daysOfWeek: [2, 3, 4, 5, 6], startTime: "09:00", endTime: "13:00" },
      { daysOfWeek: [2, 3, 4, 5, 6], startTime: "14:00", endTime: "16:00" },
    ],
  },
  {
    firstName: "Farah",
    lastName: "Khan",
    email: "farah.khan@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10007",
    specialization: "General Medicine",
    yearsOfExperience: 7,
    about: "Fictional general medicine physician offering adult primary care and routine health assessments.",
    consultationFee: 500,
    consultationMode: "ONLINE",
    facilityName: "MediConnect Riverside Clinic",
    availability: [
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "12:00" },
    ],
  },
  {
    firstName: "Aditya",
    lastName: "Bose",
    email: "aditya.bose@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10008",
    specialization: "Neurology",
    yearsOfExperience: 13,
    about: "Fictional neurologist focused on neurological assessment, headache care, and long-term condition support.",
    consultationFee: 1250,
    consultationMode: "BOTH",
    facilityName: "MediConnect Central Hospital",
    availability: [
      { daysOfWeek: [1, 2, 4, 5], startTime: "11:00", endTime: "16:00" },
    ],
  },
  {
    firstName: "Leela",
    lastName: "Nair",
    email: "leela.nair@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10009",
    specialization: "ENT",
    yearsOfExperience: 10,
    about: "Fictional ENT specialist providing assessment of common ear, nose, and throat conditions.",
    consultationFee: 850,
    consultationMode: "IN_PERSON",
    facilityName: "MediConnect Riverside Clinic",
    availability: [
      { daysOfWeek: [1, 2, 3, 4, 5], startTime: "13:00", endTime: "17:00" },
    ],
  },
  {
    firstName: "Dev",
    lastName: "Patel",
    email: "dev.patel@demo.mediconnect.test",
    licenseNumber: "MC-FIC-10010",
    specialization: "Pulmonology",
    yearsOfExperience: 15,
    about: "Fictional pulmonologist focused on respiratory health and common lung conditions.",
    consultationFee: 950,
    consultationMode: "BOTH",
    facilityName: "MediConnect City Clinic",
    availability: [
      { daysOfWeek: [1, 2, 3, 4], startTime: "09:30", endTime: "13:30" },
      { daysOfWeek: [5], startTime: "14:00", endTime: "18:00" },
    ],
  },
];
