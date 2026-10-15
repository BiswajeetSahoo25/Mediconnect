import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDoctorDirectorySearchPath,
  readDoctorDirectorySearchParams,
  updateDoctorSearchParam,
  validateDoctorSearch,
} from "../src/features/doctors/doctorSearch.ts";
import { homepageActionDestinations } from "../src/pages/homepageActions.ts";

test("homepage doctor search trims the query and safely encodes URL values", () => {
  assert.equal(buildDoctorDirectorySearchPath("  Dr. A&B  "), "/doctors?search=Dr.+A%26B");
  assert.equal(buildDoctorDirectorySearchPath("  "), "/doctors");
});

test("homepage search rejects blank input and validates the API length limit", () => {
  assert.ok(validateDoctorSearch("   ").error);
  assert.equal(validateDoctorSearch("  Dr Rao ").query, "Dr Rao");
  assert.ok(validateDoctorSearch("x".repeat(101)).error);
});

test("directory query parsing initializes search and preserves specialization aliases", () => {
  assert.deepEqual(readDoctorDirectorySearchParams(new URLSearchParams("search=Dr.+A%26B&specialty=Cardiology")), {
    search: "Dr. A&B",
    specialization: "Cardiology",
  });
  assert.equal(readDoctorDirectorySearchParams(new URLSearchParams("specializationId=spec-1")).specialization, "spec-1");
});

test("directory search changes preserve existing filters and remove blank search values", () => {
  const existing = new URLSearchParams("specialty=Cardiology&facilityId=facility-1");
  const updated = updateDoctorSearchParam(existing, "  Dr. Rao  ");
  assert.equal(updated.get("search"), "Dr. Rao");
  assert.equal(updated.get("specialty"), "Cardiology");
  assert.equal(updated.get("facilityId"), "facility-1");
  assert.equal(updateDoctorSearchParam(updated, " ").has("search"), false);
});

test("homepage quick actions link only to supported workflows", () => {
  assert.equal(homepageActionDestinations.findDoctor, "/doctors");
  assert.equal(homepageActionDestinations.videoConsultation, "/doctors");
  assert.equal(homepageActionDestinations.medicines, "/medicines");
  assert.equal(homepageActionDestinations.diagnosticTests, null);
  assert.equal(homepageActionDestinations.healthCheckups, null);
});
