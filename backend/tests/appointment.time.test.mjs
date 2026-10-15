import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

process.env.NODE_ENV = "test";
process.env.PORT ??= "4000";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/mediconnect_test";
process.env.FRONTEND_URL ??= "http://localhost:5173";
process.env.JWT_ACCESS_SECRET ??= "unit-test-only-access-secret-at-least-32-chars";
process.env.JWT_ACCESS_EXPIRES_IN ??= "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ??= "30";
process.env.GEOAPIFY_API_KEY ??= "unit-test-placeholder";
process.env.OPENFDA_API_KEY ??= "";

const time = await import("../dist/modules/appointments/appointment-time.js");
const { AppointmentService } = await import("../dist/modules/appointments/appointment.service.js");

function dbTime(value) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

function slots(date, timezone, start, end, now = new Date("2026-01-01T00:00:00Z")) {
  return time.buildAppointmentSlots(date, timezone, [{ startTime: dbTime(start), endTime: dbTime(end) }], now);
}

test("facility local conversion handles UTC, zones ahead and behind UTC, weekdays, and date rollover", () => {
  const instant = new Date("2026-01-05T00:00:00.000Z");
  assert.deepEqual(time.getFacilityLocalDateTime(instant, "UTC"), {
    date: "2026-01-05", weekday: 1, hour: 0, minute: 0, second: 0,
  });
  assert.deepEqual(time.getFacilityLocalDateTime(instant, "Asia/Kolkata"), {
    date: "2026-01-05", weekday: 1, hour: 5, minute: 30, second: 0,
  });
  assert.deepEqual(time.getFacilityLocalDateTime(instant, "Pacific/Kiritimati"), {
    date: "2026-01-05", weekday: 1, hour: 14, minute: 0, second: 0,
  });
  assert.deepEqual(time.getFacilityLocalDateTime(instant, "Pacific/Honolulu"), {
    date: "2026-01-04", weekday: 0, hour: 14, minute: 0, second: 0,
  });
  assert.equal(time.getWeekdayForLocalDate("2026-01-04"), 0);
  assert.equal(time.getWeekdayForLocalDate("2026-01-05"), 1);
  assert.equal(time.addLocalDays("2024-02-28", 1), "2024-02-29");
  assert.equal(time.addLocalDays("2024-12-31", 1), "2025-01-01");
  assert.equal(time.localDateToDatabaseDate("2026-01-04").toISOString(), "2026-01-04T00:00:00.000Z");
});

test("facility-local time calculations are independent of the server timezone", () => {
  const source = `import {getFacilityLocalDateTime,addLocalDays,buildAppointmentSlots} from './dist/modules/appointments/appointment-time.js';
const slots=buildAppointmentSlots('2026-01-05','Asia/Kolkata',[{startTime:new Date('1970-01-01T09:00:00Z'),endTime:new Date('1970-01-01T10:00:00Z')}],new Date('2026-01-01T00:00:00Z'));
console.log(JSON.stringify({local:getFacilityLocalDateTime(new Date('2026-01-05T00:00:00Z'),'Asia/Kolkata'),next:addLocalDays('2026-01-31',1),slots:slots.map(({startAt,startTime,endTime})=>({startAt,startTime,endTime}))}));`;
  const outputs = ["UTC", "America/Los_Angeles", "Asia/Kolkata"].map((TZ) =>
    execFileSync(process.execPath, ["--input-type=module", "-e", source], {
      cwd: new URL("..", import.meta.url),
      env: { ...process.env, TZ },
      encoding: "utf8",
    }).trim(),
  );
  assert.equal(outputs[1], outputs[0]);
  assert.equal(outputs[2], outputs[0]);
});

test("booking date window is the next seven facility-local calendar dates", () => {
  const now = new Date("2026-01-05T23:30:00.000Z");
  assert.deepEqual(time.getFacilityBookingDateWindow(now, "UTC"), {
    today: "2026-01-05", firstDate: "2026-01-06", lastDate: "2026-01-12",
  });
  assert.deepEqual(time.getFacilityBookingDateWindow(now, "Asia/Kolkata"), {
    today: "2026-01-06", firstDate: "2026-01-07", lastDate: "2026-01-13",
  });
});

test("slot generation requires a complete 30-minute interval and excludes past starts", () => {
  assert.equal(slots("2026-01-02", "UTC", "09:00", "09:29").length, 0);
  assert.deepEqual(slots("2026-01-02", "UTC", "09:00", "09:30").map((slot) => [slot.startTime, slot.endTime]), [["09:00", "09:30"]]);
  assert.deepEqual(slots("2026-01-02", "UTC", "09:00", "10:15").map((slot) => [slot.startTime, slot.endTime]), [["09:00", "09:30"], ["09:30", "10:00"]]);
  assert.equal(slots("2026-01-02", "UTC", "09:00", "10:00", new Date("2026-01-02T09:00:00Z")).length, 1);
  assert.equal(slots("2026-01-02", "UTC", "09:00", "10:00", new Date("2026-01-02T09:30:00Z")).length, 0);
});

test("invalid timezone identifiers fail with a clear service error", () => {
  assert.throws(() => time.getFacilityLocalDateTime(new Date(), "Mars/Olympus_Mons"), (error) =>
    error.statusCode === 500 && error.message.includes("invalid timezone"),
  );
});

test("DST gaps and folds are omitted instead of resolving to an arbitrary instant", () => {
  assert.deepEqual(time.getInstantsForFacilityWallTime("2026-03-08", 2 * 60 + 30, "America/New_York"), []);
  assert.equal(time.getInstantsForFacilityWallTime("2026-11-01", 1 * 60 + 30, "America/New_York").length, 2);
  const springSlots = slots("2026-03-08", "America/New_York", "01:00", "04:00");
  assert.deepEqual(springSlots.map((slot) => slot.startTime), ["01:00", "03:00", "03:30"]);
  const fallSlots = slots("2026-11-01", "America/New_York", "00:30", "03:00");
  assert.deepEqual(fallSlots.map((slot) => slot.startTime), ["02:00", "02:30"]);
});

const FIXED_NOW = new Date("2026-01-05T07:00:00.000Z");
const allDays = [0, 1, 2, 3, 4, 5, 6];
function makeService({ timezone = "UTC", enabled = true, verified = true, facilityVerified = true, consultationMode = "BOTH", doctorLeaves = [], facilityLeaves = [], availability = allDays.map((dayOfWeek) => ({ dayOfWeek, startTime: dbTime("09:00"), endTime: dbTime("12:00"), isActive: true })), assignmentId = "11111111-1111-4111-8111-111111111111" } = {}) {
  const created = [];
  const assignment = {
    id: assignmentId,
    doctorId: "doctor-a",
    onlineBookingEnabled: enabled,
    onlineBookingLimit: null,
    consultationMode,
    availability,
    leaves: facilityLeaves,
    doctor: { leaves: doctorLeaves },
    facility: { timezone, isVerified: facilityVerified },
  };
  const repository = {
    findPatientByUserId: async () => ({ id: "patient-a" }),
    findActiveDoctorFacility: async (id) => id === assignmentId && verified ? assignment : null,
    findAppointmentsForDate: async () => [],
    findDoctorAppointmentsNearSlots: async () => [],
    createBooking: async (input) => { created.push(input); return input; },
  };
  return { service: new AppointmentService(repository, () => new Date(FIXED_NOW)), created, assignment };
}

function input(assignmentId, startAt, appointmentModel = "IN_PERSON") {
  return { doctorFacilityId: assignmentId, appointmentType: "CONSULTATION", appointmentModel, appointmentStartAt: new Date(startAt) };
}

test("availability slots are the same timestamps accepted by booking creation", async () => {
  const { service, created, assignment } = makeService({ timezone: "Asia/Kolkata" });
  const availability = await service.getAvailability(assignment.id);
  assert.equal(availability.timezone, "Asia/Kolkata");
  assert.equal(availability.dates.length, 7);
  assert.equal(availability.dates[0].date, "2026-01-06");
  assert.equal(availability.dates.at(-1).date, "2026-01-12");
  const slot = availability.dates[0].slots[0];
  await service.create("user-a", input(assignment.id, slot.startAt));
  assert.equal(created.length, 1);
  assert.equal(created[0].appointmentDate.toISOString().slice(0, 10), availability.dates[0].date);
  await assert.rejects(service.create("user-a", input(assignment.id, new Date(Date.parse(slot.startAt) + 5 * 60_000))), (error) => error.statusCode === 400);
});

test("booking accepts the first and seventh local day, rejects same-day and eighth-day slots", async () => {
  const { service, created, assignment } = makeService();
  const window = time.getFacilityBookingDateWindow(FIXED_NOW, "UTC");
  const start = (date) => time.getInstantsForFacilityWallTime(date, 9 * 60, "UTC")[0].toISOString();
  await service.create("user-a", input(assignment.id, start(window.firstDate)));
  await service.create("user-a", input(assignment.id, start(window.lastDate)));
  assert.equal(created.length, 2);
  await assert.rejects(service.create("user-a", input(assignment.id, start(window.today))), (error) => error.statusCode === 400);
  await assert.rejects(service.create("user-a", input(assignment.id, start(time.addLocalDays(window.lastDate, 1)))), (error) => error.statusCode === 400);
});

test("booking rejects disabled or ineligible assignments, leaves, and unsupported consultation modes", async () => {
  const date = time.addLocalDays(time.getFacilityBookingDateWindow(FIXED_NOW, "UTC").today, 1);
  const startAt = time.getInstantsForFacilityWallTime(date, 9 * 60, "UTC")[0].toISOString();
  const disabled = makeService({ enabled: false });
  await assert.rejects(disabled.service.create("user-a", input(disabled.assignment.id, startAt)), (error) => error.statusCode === 400);
  const unverified = makeService({ verified: false });
  await assert.rejects(unverified.service.create("user-a", input(unverified.assignment.id, startAt)), (error) => error.statusCode === 404);
  const unverifiedFacility = makeService({ facilityVerified: false });
  await assert.rejects(unverifiedFacility.service.create("user-a", input(unverifiedFacility.assignment.id, startAt)), (error) => error.statusCode === 400);
  await assert.rejects(unverified.service.create("user-a", input("22222222-2222-4222-8222-222222222222", startAt)), (error) => error.statusCode === 404);
  const onLeave = makeService({ doctorLeaves: [{ startDate: time.localDateToDatabaseDate(date), endDate: time.localDateToDatabaseDate(date) }] });
  await assert.rejects(onLeave.service.create("user-a", input(onLeave.assignment.id, startAt)), (error) => error.statusCode === 400);
  const facilityLeave = makeService({ facilityLeaves: [{ startDate: time.localDateToDatabaseDate(date), endDate: time.localDateToDatabaseDate(date) }] });
  await assert.rejects(facilityLeave.service.create("user-a", input(facilityLeave.assignment.id, startAt)), (error) => error.statusCode === 400);
  const onlineOnly = makeService({ consultationMode: "ONLINE" });
  await assert.rejects(onlineOnly.service.create("user-a", input(onlineOnly.assignment.id, startAt, "IN_PERSON")), (error) => error.statusCode === 400);
  await onlineOnly.service.create("user-a", input(onlineOnly.assignment.id, startAt, "VIDEO_CALL"));
  const unsupported = makeService({ consultationMode: "HYBRID" });
  await assert.rejects(unsupported.service.create("user-a", input(unsupported.assignment.id, startAt)), (error) => error.statusCode === 400);
});
