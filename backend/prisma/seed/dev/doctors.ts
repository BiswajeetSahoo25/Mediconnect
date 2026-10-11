import argon2 from "argon2";
import {
  LicenseStatus,
  UserRole,
} from "../../../src/generated/prisma/client.js";
import { prisma } from "../../../src/config/prisma.js";
import { doctorSeedData } from "./doctor-data.js";

const DEMO_DOCTOR_PASSWORD =
  process.env.SEED_DOCTOR_PASSWORD ?? "DemoDoctor@123";

const facilities = [
  {
    name: "MediConnect Central Hospital",
    description:
      "Fictional demo hospital used for MediConnect development and testing.",
    facilityType: "HOSPITAL",
    phone: "+91-9000000001",
    email: "central.hospital@demo.mediconnect.test",
    timezone: "Asia/Kolkata",
  },
  {
    name: "MediConnect City Clinic",
    description:
      "Fictional multi-specialty clinic used for MediConnect development and testing.",
    facilityType: "CLINIC",
    phone: "+91-9000000002",
    email: "city.clinic@demo.mediconnect.test",
    timezone: "Asia/Kolkata",
  },
];

const departmentNames = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "General Medicine",
  "Endocrinology",
  "Orthopedics",
  "Neurology",
  "Ophthalmology",
  "Psychiatry",
  "ENT",
  "Pulmonology",
];

async function findOrCreateFacility(
  facilityData: (typeof facilities)[number],
  adminId: string,
) {
  const existing = await prisma.healthcareFacility.findFirst({
    where: {
      name: facilityData.name,
      deletedAt: null,
    },
  });

  if (existing) {
    return prisma.healthcareFacility.update({
      where: {
        id: existing.id,
      },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      },
    });
  }
  return prisma.healthcareFacility.create({
    data: {
      ...facilityData,
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: adminId,
    },
  });
}

async function seedFacilities(adminId: string) {
  const seededFacilities = [];

  for (const facilityData of facilities) {
    const facility = await findOrCreateFacility(facilityData, adminId);

    seededFacilities.push(facility);

    console.log(`Facility ready: ${facility.name}`);
  }

  return seededFacilities;
}

async function seedDepartments(facilityId: string) {
  const departments = [];

  for (const name of departmentNames) {
    const department = await prisma.department.upsert({
      where: {
        facilityId_name: {
          facilityId,
          name,
        },
      },
      update: {
        description: `${name} department at a fictional MediConnect demo facility.`,
      },
      create: {
        facilityId,
        name,
        description: `${name} department at a fictional MediConnect demo facility.`,
      },
    });

    departments.push(department);
  }

  return departments;
}

async function seedDoctorRecords(
  adminId: string,
  facilityIds: string[],
  departmentMap: Map<string, string>,
) {
  for (let index = 0; index < doctorSeedData.length; index++) {
    const doctorData = doctorSeedData[index];
    const passwordHash = await argon2.hash(
      doctorData.password ?? DEMO_DOCTOR_PASSWORD,
    );

    /*
     * --------------------------------------------------
     * USER
     * --------------------------------------------------
     */

    const user = await prisma.user.upsert({
      where: {
        email: doctorData.email,
      },
      update: {
        role: UserRole.DOCTOR,
        isVerified: true,
        isActive: true,
        ...(doctorData.password
          ? { passwordHash, onboardingCompletedAt: new Date() }
          : {}),
      },
      create: {
        email: doctorData.email,
        passwordHash,
        role: UserRole.DOCTOR,
        isVerified: true,
        isActive: true,
        ...(doctorData.password ? { onboardingCompletedAt: new Date() } : {}),
      },
    });

    /*
     * --------------------------------------------------
     * SPECIALIZATION
     * --------------------------------------------------
     */

    const specialization = await prisma.specialization.upsert({
      where: {
        name: doctorData.specialization,
      },
      update: {},
      create: {
        name: doctorData.specialization,
        description: `Fictional ${doctorData.specialization} specialization for MediConnect development data.`,
      },
    });

    /*
     * --------------------------------------------------
     * DOCTOR
     * --------------------------------------------------
     */

    const doctor = await prisma.doctor.upsert({
      where: {
        licenseNumber: doctorData.licenseNumber,
      },
      update: {
        userId: user.id,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        licenseAuthority: "MediConnect Demo Medical Authority",
        licenseVerificationStatus: LicenseStatus.VERIFIED,
        licenseVerifiedAt: new Date(),
        licenseVerifiedBy: adminId,
        yearsOfExperience: doctorData.yearsOfExperience,
        about: doctorData.about,
        isActive: true,
        deletedAt: null,
      },
      create: {
        userId: user.id,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        licenseNumber: doctorData.licenseNumber,
        licenseAuthority: "MediConnect Demo Medical Authority",
        licenseVerificationStatus: LicenseStatus.VERIFIED,
        licenseVerifiedAt: new Date(),
        licenseVerifiedBy: adminId,
        yearsOfExperience: doctorData.yearsOfExperience,
        about: doctorData.about,
        isActive: true,
      },
    });

    /*
     * --------------------------------------------------
     * DOCTOR SPECIALIZATION
     * --------------------------------------------------
     */

    await prisma.doctorSpecialization.upsert({
      where: {
        doctorId_specializationId: {
          doctorId: doctor.id,
          specializationId: specialization.id,
        },
      },
      update: {
        yearsInSpecialization: doctorData.yearsOfExperience,
        isPrimary: true,
      },
      create: {
        doctorId: doctor.id,
        specializationId: specialization.id,
        yearsInSpecialization: doctorData.yearsOfExperience,
        isPrimary: true,
      },
    });

    /*
     * --------------------------------------------------
     * FACILITY + DEPARTMENT
     * --------------------------------------------------
     */

    const facilityId = facilityIds[index % facilityIds.length];

    const departmentId = departmentMap.get(
      `${facilityId}:${doctorData.specialization}`,
    );

    if (!departmentId) {
      throw new Error(
        `Department not found for ${doctorData.specialization} at facility ${facilityId}`,
      );
    }

    /*
     * --------------------------------------------------
     * DOCTOR FACILITY
     * --------------------------------------------------
     */

    const doctorFacility = await prisma.doctorFacility.upsert({
      where: {
        doctorId_facilityId_departmentId: {
          doctorId: doctor.id,
          facilityId,
          departmentId,
        },
      },
      update: {
        consultationFee: doctorData.consultationFee,
        consultationMode: doctorData.consultationMode,
        onlineBookingEnabled: true,
        onlineBookingLimit: 20,
        isActive: true,
      },
      create: {
        doctorId: doctor.id,
        facilityId,
        departmentId,
        consultationFee: doctorData.consultationFee,
        consultationMode: doctorData.consultationMode,
        onlineBookingEnabled: true,
        onlineBookingLimit: 20,
        joiningDate: new Date("2025-01-01"),
        isActive: true,
      },
    });

    /*
     * --------------------------------------------------
     * DOCTOR AVAILABILITY
     * --------------------------------------------------
     *
     * Monday-Friday
     * 09:00 - 13:00
     * 14:00 - 17:00
     */

    const availability = [
      {
        dayOfWeek: 1,
        startTime: new Date("1970-01-01T09:00:00.000Z"),
        endTime: new Date("1970-01-01T13:00:00.000Z"),
      },
      {
        dayOfWeek: 2,
        startTime: new Date("1970-01-01T09:00:00.000Z"),
        endTime: new Date("1970-01-01T13:00:00.000Z"),
      },
      {
        dayOfWeek: 3,
        startTime: new Date("1970-01-01T09:00:00.000Z"),
        endTime: new Date("1970-01-01T13:00:00.000Z"),
      },
      {
        dayOfWeek: 4,
        startTime: new Date("1970-01-01T09:00:00.000Z"),
        endTime: new Date("1970-01-01T13:00:00.000Z"),
      },
      {
        dayOfWeek: 5,
        startTime: new Date("1970-01-01T09:00:00.000Z"),
        endTime: new Date("1970-01-01T13:00:00.000Z"),
      },
    ];

    for (const slot of availability) {
      await prisma.doctorAvailability.upsert({
        where: {
          doctorFacilityId_dayOfWeek_startTime_endTime: {
            doctorFacilityId: doctorFacility.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        },
        update: {
          isActive: true,
        },
        create: {
          doctorFacilityId: doctorFacility.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: true,
        },
      });
    }

    console.log(
      `Doctor ready: Dr. ${doctor.firstName} ${doctor.lastName ?? ""} (${doctorData.specialization})`,
    );
  }
}

async function seedDoctors() {
  /*
   * --------------------------------------------------
   * ADMIN
   * --------------------------------------------------
   *
   * We reuse the same admin credentials used by
   * the article seed.
   */

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required",
    );
  }

  const adminPasswordHash = await argon2.hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });

  /*
   * --------------------------------------------------
   * FACILITIES
   * --------------------------------------------------
   */

  const seededFacilities = await seedFacilities(admin.id);

  /*
   * --------------------------------------------------
   * DEPARTMENTS
   * --------------------------------------------------
   */

  const departmentMap = new Map<string, string>();

  for (const facility of seededFacilities) {
    const departments = await seedDepartments(facility.id);

    for (const department of departments) {
      departmentMap.set(`${facility.id}:${department.name}`, department.id);
    }
  }

  /*
   * --------------------------------------------------
   * DOCTORS
   * --------------------------------------------------
   */

  await seedDoctorRecords(
    admin.id,
    seededFacilities.map((facility) => facility.id),
    departmentMap,
  );
  console.log(`Seeded ${doctorSeedData.length} fictional doctors.`);
}

seedDoctors()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
