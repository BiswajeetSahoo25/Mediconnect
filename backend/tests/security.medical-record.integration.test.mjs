import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { env } from "../dist/config/env.js";
import { prisma } from "../dist/config/prisma.js";
import { MedicalRecordRepository } from "../dist/modules/patients/medical-record.repository.js";
import { PatientRepository } from "../dist/modules/patients/patient.repository.js";
import { MedicalRecordService } from "../dist/modules/patients/medical-record.service.js";

const enabled = process.env.RUN_SECURITY_INTEGRATION_TESTS === "1";
if (enabled) {
  if (env.nodeEnv !== "test") throw new Error("Security integration tests require NODE_ENV=test");
  const databaseUrl = new URL(env.databaseUrl);
  if (!["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname)) {
    throw new Error("Security integration tests only run against a local PostgreSQL database");
  }
  if (!databaseUrl.pathname.toLowerCase().includes("test")) {
    throw new Error("Security integration tests require a dedicated database whose name contains 'test'");
  }
} else {
  test("medical-record database isolation tests require explicit local-test opt-in", {
    skip: "Set RUN_SECURITY_INTEGRATION_TESTS=1 and use NODE_ENV=test with a localhost database whose name contains 'test'",
  });
}

let fixtures = [];
let service;
before(async () => {
  if (!enabled) return;
  const unique = randomUUID();
  const fixture = await prisma.$transaction(async (tx) => {
    const users = await Promise.all(["a", "b"].map((suffix) => tx.user.create({
      data: { email: `security-${unique}-${suffix}@example.invalid`, passwordHash: "test-fixture-only" },
    })));
    const patients = await Promise.all(users.map((user) => tx.patient.create({ data: { userId: user.id } })));
    const fileData = Buffer.from("%PDF-1.7 synthetic fixture");
    const doc = await tx.medicalDocument.create({ data: {
      patientId: patients[1].id,
      uploadedBy: users[1].id,
      documentType: "LAB_REPORT",
      fileName: "fixture.pdf",
      fileUrl: `/test/${unique}`,
      fileData,
      mimeType: "application/pdf",
      fileSize: fileData.length,
    } });
    return { users, patients, doc };
  });
  fixtures = [fixture];
  service = new MedicalRecordService(new PatientRepository(), new MedicalRecordRepository());
});
after(async () => {
  if (!enabled || !fixtures.length) return;
  for (const fixture of fixtures) {
    await prisma.medicalDocument.deleteMany({ where: { id: fixture.doc.id } });
    await prisma.patient.deleteMany({ where: { id: { in: fixture.patients.map((patient) => patient.id) } } });
    await prisma.user.deleteMany({ where: { id: { in: fixture.users.map((user) => user.id) } } });
  }
  await prisma.$disconnect();
});

if (enabled) {
  test("patient A cannot list, download, or delete patient B's known record UUID", async () => {
    const [{ users, patients, doc }] = fixtures;
    const ownRows = await service.list(users[0].id);
    assert.equal(ownRows.some((row) => row.id === doc.id), false);
    await assert.rejects(service.getFile(users[0].id, doc.id), (error) => error.statusCode === 404);
    await assert.rejects(service.delete(users[0].id, doc.id), (error) => error.statusCode === 404);
    const stillPresent = await prisma.medicalDocument.findUnique({ where: { id: doc.id } });
    assert.equal(stillPresent.patientId, patients[1].id);
  });

  test("patient B can read their own record and verified records cannot be deleted", async () => {
    const [{ users, doc }] = fixtures;
    const file = await service.getFile(users[1].id, doc.id);
    assert.equal(file.fileData.toString(), "%PDF-1.7 synthetic fixture");
    await prisma.medicalDocument.update({ where: { id: doc.id }, data: { isVerified: true } });
    await assert.rejects(service.delete(users[1].id, doc.id), (error) => error.statusCode === 400);
    assert.ok(await prisma.medicalDocument.findUnique({ where: { id: doc.id } }));
  });
}
