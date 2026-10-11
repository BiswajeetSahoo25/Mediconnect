import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { AppError } from "../dist/errors/app-error.js";
import { env } from "../dist/config/env.js";
import { prisma } from "../dist/config/prisma.js";
import { AppointmentRepository } from "../dist/modules/appointments/appointment.repository.js";
import { AppointmentService } from "../dist/modules/appointments/appointment.service.js";

const integrationEnabled =
  process.env.RUN_APPOINTMENT_INTEGRATION_TESTS === "1";

if (integrationEnabled) {
  if (env.nodeEnv !== "test") {
    throw new Error("Appointment integrity tests require NODE_ENV=test");
  }
  const databaseUrl = new URL(env.databaseUrl);
  if (!["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname)) {
    throw new Error(
      "Appointment integrity tests only run against a local PostgreSQL database",
    );
  }
} else {
  test("appointment integrity integration tests require explicit opt-in", {
    skip: "Set RUN_APPOINTMENT_INTEGRATION_TESTS=1 to create and clean up isolated test rows",
  });
}

const repository = new AppointmentRepository();
const service = new AppointmentService(repository);
let fixture;

function utcDateAfter(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function atUtcTime(date, hours, minutes = 0) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
    ),
  );
}

function bookingInput({ assignment, date, hour, minute = 0, limit = null }) {
  return {
    patientId: fixture.patient.id,
    doctorId: fixture.doctor.id,
    doctorFacilityId: assignment.id,
    appointmentDate: date,
    appointmentStartAt: atUtcTime(date, hour, minute),
    onlineBookingLimit: limit,
    appointmentType: "CONSULTATION",
    appointmentModel: "IN_PERSON",
  };
}

async function createFixture() {
  const token = randomUUID();
  return prisma.$transaction(async (tx) => {
    const patientUser = await tx.user.create({
      data: {
        email: `appointment-test-patient-${token}@example.invalid`,
        passwordHash: "integration-test-only",
      },
    });
    const doctorUser = await tx.user.create({
      data: {
        email: `appointment-test-doctor-${token}@example.invalid`,
        passwordHash: "integration-test-only",
        role: "DOCTOR",
      },
    });

    const patient = await tx.patient.create({
      data: { userId: patientUser.id },
    });
    const doctor = await tx.doctor.create({
      data: {
        userId: doctorUser.id,
        firstName: "Appointment Test",
        licenseNumber: `TEST-${token}`,
        licenseVerificationStatus: "VERIFIED",
      },
    });

    const facilities = [];
    const assignments = [];
    for (const suffix of ["one", "two"]) {
      const facility = await tx.healthcareFacility.create({
        data: {
          name: `Appointment Test ${suffix} ${token}`,
          facilityType: "CLINIC",
          timezone: "UTC",
          isVerified: true,
        },
      });
      const department = await tx.department.create({
        data: { facilityId: facility.id, name: `Appointment Test ${token}` },
      });
      const assignment = await tx.doctorFacility.create({
        data: {
          doctorId: doctor.id,
          facilityId: facility.id,
          departmentId: department.id,
          consultationFee: "100.00",
          consultationMode: "BOTH",
          joiningDate: utcDateAfter(-1),
        },
      });
      facilities.push({ facility, department });
      assignments.push(assignment);
    }

    return {
      patientUser,
      doctorUser,
      patient,
      doctor,
      facilities,
      assignments,
    };
  });
}

async function cleanFixture() {
  if (!fixture) return;
  const assignmentIds = fixture.assignments.map(({ id }) => id);
  const facilityIds = fixture.facilities.map(({ facility }) => facility.id);
  const departmentIds = fixture.facilities.map(({ department }) => department.id);

  await prisma.appointment.deleteMany({ where: { patientId: fixture.patient.id } });
  await prisma.appointmentDailyCounter.deleteMany({
    where: { doctorFacilityId: { in: assignmentIds } },
  });
  await prisma.doctorFacility.deleteMany({ where: { id: { in: assignmentIds } } });
  await prisma.department.deleteMany({ where: { id: { in: departmentIds } } });
  await prisma.healthcareFacility.deleteMany({ where: { id: { in: facilityIds } } });
  await prisma.doctor.delete({ where: { id: fixture.doctor.id } });
  await prisma.patient.delete({ where: { id: fixture.patient.id } });
  await prisma.user.deleteMany({
    where: { id: { in: [fixture.patientUser.id, fixture.doctorUser.id] } },
  });
  fixture = undefined;
}

if (integrationEnabled) {
  before(async () => {
    fixture = await createFixture();
  });

  after(async () => {
    try {
      await cleanFixture();
    } finally {
      await prisma.$disconnect();
    }
  });

  test("only one concurrent cancellation transitions a scheduled appointment", async () => {
    const date = utcDateAfter(45);
    const appointment = await repository.createBooking(
      bookingInput({ assignment: fixture.assignments[0], date, hour: 9 }),
    );

    const results = await Promise.allSettled([
      service.cancel(fixture.patientUser.id, appointment.id, { reason: "Test cancellation one" }),
      service.cancel(fixture.patientUser.id, appointment.id, { reason: "Test cancellation two" }),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected");
    assert.ok(rejected.reason instanceof AppError);
    assert.equal(rejected.reason.statusCode, 409);
    const stored = await prisma.appointment.findUnique({ where: { id: appointment.id } });
    assert.equal(stored?.status, "CANCELLED");
  });

  test("simultaneous requests for one slot create only one appointment", async () => {
    const date = utcDateAfter(46);
    const input = bookingInput({ assignment: fixture.assignments[0], date, hour: 10 });
    const results = await Promise.allSettled([
      repository.createBooking(input),
      repository.createBooking(input),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected");
    assert.ok(rejected.reason instanceof AppError);
    assert.equal(rejected.reason.statusCode, 409);
    assert.equal(
      await prisma.appointment.count({
        where: { patientId: fixture.patient.id, appointmentDate: date },
      }),
      1,
    );
  });

  test("overlapping bookings across a doctor's assignments conflict", async () => {
    const date = utcDateAfter(47);
    const results = await Promise.allSettled(
      fixture.assignments.map((assignment, index) =>
        repository.createBooking({
          ...bookingInput({ assignment, date, hour: 11, minute: index * 15 }),
          appointmentStartAt: atUtcTime(date, 11, index * 15),
        }),
      ),
    );

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected");
    assert.ok(rejected.reason instanceof AppError);
    assert.equal(rejected.reason.statusCode, 409);
    assert.equal(
      await prisma.appointment.count({
        where: {
          patientId: fixture.patient.id,
          appointmentDate: date,
          doctorFacilityId: { in: fixture.assignments.map(({ id }) => id) },
        },
      }),
      1,
    );
  });

  test("concurrent bookings respect the daily capacity limit", async () => {
    const date = utcDateAfter(48);
    const results = await Promise.allSettled([
      repository.createBooking(
        bookingInput({ assignment: fixture.assignments[0], date, hour: 9, limit: 1 }),
      ),
      repository.createBooking(
        bookingInput({ assignment: fixture.assignments[0], date, hour: 10, limit: 1 }),
      ),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected");
    assert.ok(rejected.reason instanceof AppError);
    assert.equal(rejected.reason.statusCode, 409);
    assert.equal(
      await prisma.appointment.count({
        where: {
          patientId: fixture.patient.id,
          doctorFacilityId: fixture.assignments[0].id,
          appointmentDate: date,
          status: "SCHEDULED",
        },
      }),
      1,
    );
  });

  test("concurrent queue allocation is unique and gap-free", async () => {
    const date = utcDateAfter(49);
    const bookingCount = 12;
    const results = await Promise.all(
      Array.from({ length: bookingCount }, (_, index) =>
        repository.createBooking(
          bookingInput({
            assignment: fixture.assignments[0],
            date,
            hour: 8 + Math.floor(index / 2),
            minute: (index % 2) * 30,
          }),
        ),
      ),
    );
    const queueNumbers = results.map(({ queueNumber }) => queueNumber).sort((a, b) => a - b);

    assert.equal(new Set(queueNumbers).size, bookingCount);
    assert.deepEqual(queueNumbers, Array.from({ length: bookingCount }, (_, index) => index + 1));
  });
} else {
  after(async () => prisma.$disconnect());
}
