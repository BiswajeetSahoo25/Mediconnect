import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

process.env.NODE_ENV = "test";
process.env.PORT ??= "4000";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/mediconnect_test";
process.env.FRONTEND_URL ??= "http://localhost:5173";
process.env.JWT_ACCESS_SECRET ??= "unit-test-only-access-secret-at-least-32-chars";
process.env.JWT_ACCESS_EXPIRES_IN ??= "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ??= "30";
process.env.GEOAPIFY_API_KEY ??= "unit-test-placeholder";

const [express, cookieParser, errorModule, auth, roles, verified, doctorRouter, recordRouter,
  access, validation, authServiceModule, refreshTokens, httpErrors, medValidation,
  medServiceModule, medRepoModule, patientRepoModule, controllerModule, userSchemas] = await Promise.all([
  import("express"), import("cookie-parser"), import("../dist/middleware/error.middleware.js"),
  import("../dist/middleware/auth.middleware.js"), import("../dist/middleware/role.middleware.js"),
  import("../dist/middleware/verified-doctor.middleware.js"), import("../dist/modules/doctors/doctor.routes.js"),
  import("../dist/modules/patients/medical-record.routes.js"), import("../dist/modules/auth/access-token.js"),
  import("../dist/modules/auth/refresh-token.js"), import("../dist/modules/auth/auth.service.js"),
  import("../dist/modules/auth/refresh-token.js"), import("../dist/errors/http-errors.js"),
  import("../dist/modules/patients/medical-record.validation.js"), import("../dist/modules/patients/medical-record.service.js"),
  import("../dist/modules/patients/medical-record.repository.js"), import("../dist/modules/patients/patient.repository.js"),
  import("../dist/modules/patients/medical-record.controller.js"), import("../dist/modules/users/user.validation.js"),
]);
const { AuthController } = await import("../dist/modules/auth/auth.controller.js");
const authRouter = (await import("../dist/modules/auth/auth.routes.js")).default;

let server;
let baseUrl;
before(async () => {
  const app = express.default();
  app.use(cookieParser.default());
  app.use("/doctors", doctorRouter.default);
  app.use("/records", express.default.json(), recordRouter.default);
  app.use("/auth", express.default.json(), authRouter);
  app.get("/auth-probe", auth.requireAuth, (req, res) => res.status(200).json({ subject: req.user.sub, role: req.user.role }));
  app.use(errorModule.errorMiddleware);
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

async function token(role = "PATIENT", sub = "patient-a") {
  return access.generateAccessToken(sub, role);
}
async function request(path, { method = "GET", cookie, body } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test("auth middleware rejects missing, malformed, invalid, and expired access cookies; accepts a valid token", async () => {
  const missing = await request("/doctors/me");
  assert.equal(missing.status, 401);
  for (const value of ["not-a-jwt", "a.b.c"]) {
    assert.equal((await request("/doctors/me", { cookie: `accessToken=${value}` })).status, 401);
  }
  const jose = await import("jose");
  const expired = await new jose.SignJWT({ role: "PATIENT" })
    .setProtectedHeader({ alg: "HS256" }).setSubject("patient-a").setIssuedAt(1).setExpirationTime(2)
    .sign(new TextEncoder().encode(process.env.JWT_ACCESS_SECRET));
  assert.equal((await request("/doctors/me", { cookie: `accessToken=${expired}` })).status, 401);
  const valid = await token();
  const allowed = await request("/auth-probe", { cookie: `accessToken=${valid}` });
  assert.equal(allowed.status, 200);
  assert.deepEqual(await allowed.json(), { subject: "patient-a", role: "PATIENT" });
});

test("patient role cannot access admin review or doctor workspace routes; client role injection is rejected", async () => {
  const patientToken = await token("PATIENT");
  for (const [path, method] of [["/doctors/applications", "GET"], ["/doctors/applications/00000000-0000-4000-8000-000000000001/approve", "PATCH"], ["/doctors/me", "GET"], ["/doctors/me/practice", "GET"]]) {
    const response = await request(path, { method, cookie: `accessToken=${patientToken}` });
    assert.equal(response.status, 403, `${path} should be forbidden to patients`);
  }
  assert.equal((await request("/doctors/applications")).status, 401);
  assert.equal(userSchemas.createUserSchema.safeParse({ email: "x@example.invalid", password: "SecurePass123!", role: "ADMIN" }).success, false);
  assert.equal(userSchemas.loginSchema.safeParse({ email: "x@example.invalid", password: "anything", role: "ADMIN" }).success, false);
  assert.equal((await request("/auth/signup", { method: "POST", body: { email: "x@example.invalid", password: "SecurePass123!", role: "ADMIN" } })).status, 400);
});

test("verified-doctor guard rejects missing, unverified, inactive, and deleted doctor or user states", async () => {
  const { createRequireVerifiedDoctor } = verified;
  const validDoctor = { isActive: true, deletedAt: null, licenseVerificationStatus: "VERIFIED", user: { isActive: true, deletedAt: null } };
  for (const doctor of [null,
    { ...validDoctor, licenseVerificationStatus: "PENDING" },
    { ...validDoctor, isActive: false },
    { ...validDoctor, deletedAt: new Date() },
    { ...validDoctor, user: { isActive: false, deletedAt: null } },
    { ...validDoctor, user: { isActive: true, deletedAt: new Date() } },
  ]) {
    const guard = createRequireVerifiedDoctor(async () => doctor);
    const req = { user: { sub: "doctor-id" } };
    let forwarded;
    await assert.rejects(guard(req, {}, (error) => { forwarded = error; }), (error) => error.statusCode === 403);
    assert.equal(forwarded, undefined);
  }
  let next = false;
  await createRequireVerifiedDoctor(async () => validDoctor)({ user: { sub: "doctor-id" } }, {}, () => { next = true; });
  assert.equal(next, true);
});

test("medical record routes require authentication for list, upload, download, and delete", async () => {
  assert.equal((await request("/records")).status, 401);
  assert.equal((await request("/records", { method: "POST", body: {} })).status, 401);
  assert.equal((await request("/records/00000000-0000-4000-8000-000000000001/file")).status, 401);
  assert.equal((await request("/records/00000000-0000-4000-8000-000000000001", { method: "DELETE" })).status, 401);
});

test("record validation rejects malformed IDs, unsupported types, invalid Base64, and mismatched signatures", async () => {
  assert.equal(medValidation.medicalRecordIdSchema.safeParse({ id: "abc" }).success, false);
  const validBody = { fileName: "scan.pdf", documentType: "LAB_REPORT", mimeType: "application/pdf", contentBase64: Buffer.from("%PDF-1.7 test").toString("base64") };
  assert.equal(medValidation.createMedicalRecordSchema.safeParse({ ...validBody, mimeType: "text/html" }).success, false);
  assert.equal(medValidation.createMedicalRecordSchema.safeParse({ ...validBody, contentBase64: "%%%" }).success, false);
  const patientRepository = { findByUserId: async () => ({ id: "patient-a" }) };
  const recordRepository = { create: async () => { throw new Error("should not create invalid file"); } };
  const service = new medServiceModule.MedicalRecordService(patientRepository, recordRepository);
  await assert.rejects(service.create("user-a", { ...validBody, contentBase64: Buffer.from("not pdf").toString("base64") }), (error) => error.statusCode === 400);
  const tooLarge = Buffer.alloc(medValidation.MAX_MEDICAL_RECORD_BYTES + 1, 1).toString("base64");
  await assert.rejects(service.create("user-a", { ...validBody, contentBase64: tooLarge }), (error) => error.statusCode === 400);
});

test("medical record service scopes list, download, and delete to the authenticated patient and blocks verified deletion", async () => {
  const calls = [];
  const patientRepository = { findByUserId: async (userId) => ({ id: userId === "user-a" ? "patient-a" : "patient-b" }) };
  const recordRepository = {
    findManyByPatientId: async (patientId) => { calls.push(["list", patientId]); return [{ patientId }]; },
    findFileById: async (id, patientId) => { calls.push(["file", id, patientId]); return patientId === "patient-a" ? null : { id, patientId, fileName: "private.pdf", mimeType: "application/pdf", fileData: Buffer.from("%PDF-") }; },
    findByIdForOwner: async (id, patientId, userId) => { calls.push(["owner", id, patientId, userId]); return patientId === "patient-a" ? null : { id, isVerified: true }; },
    deleteOwned: async (...args) => { calls.push(["delete", ...args]); return { count: 1 }; },
  };
  const service = new medServiceModule.MedicalRecordService(patientRepository, recordRepository);
  assert.deepEqual(await service.list("user-a"), [{ patientId: "patient-a" }]);
  await assert.rejects(service.getFile("user-a", "record-b"), (error) => error.statusCode === 404);
  await assert.rejects(service.delete("user-a", "record-b"), (error) => error.statusCode === 404);
  assert.deepEqual(calls.slice(0, 3), [["list", "patient-a"], ["file", "record-b", "patient-a"], ["owner", "record-b", "patient-a", "user-a"]]);
  await assert.rejects(service.delete("user-b", "verified-record"), (error) => error.statusCode === 400);
  assert.equal(calls.some(([type]) => type === "delete"), false);
});

test("medical record repository scopes every read and delete query by patient and owner", async () => {
  const queries = [];
  const database = { medicalDocument: {
    findMany: async (query) => { queries.push(["list", query]); return []; },
    findFirst: async (query) => { queries.push(["find", query]); return null; },
    deleteMany: async (query) => { queries.push(["delete", query]); return { count: 0 }; },
  } };
  const repository = new medRepoModule.MedicalRecordRepository(database);
  await repository.findManyByPatientId("patient-a");
  await repository.findFileById("record-b", "patient-a");
  await repository.findByIdForOwner("record-b", "patient-a", "user-a");
  await repository.deleteOwned("record-b", "patient-a", "user-a");
  assert.deepEqual(queries.map(([kind, query]) => [kind, query.where]), [
    ["list", { patientId: "patient-a" }], ["find", { id: "record-b", patientId: "patient-a" }],
    ["find", { id: "record-b", patientId: "patient-a", uploadedBy: "user-a" }],
    ["delete", { id: "record-b", patientId: "patient-a", uploadedBy: "user-a", isVerified: false }],
  ]);
});

test("medical record download keeps private safe headers and returns only service-provided file data", async () => {
  const bytes = Buffer.from("%PDF-1.7 fixture");
  const controller = new controllerModule.MedicalRecordController({ getFile: async () => ({ fileName: 'test"\r\n.pdf', mimeType: "application/pdf", fileData: bytes }) });
  const headers = {};
  const response = { status(code) { this.statusCode = code; return this; }, set(values) { Object.assign(headers, values); return this; }, send(body) { this.body = body; return this; } };
  await controller.download({ user: { sub: "patient-a" }, validated: { params: { id: "record-a" } } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.toString(), bytes.toString());
  assert.equal(headers["Cache-Control"], "private, no-store");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Content-Type"], "application/pdf");
  assert.match(headers["Content-Disposition"], /filename\*=UTF-8''/);
  assert.equal(headers["Content-Disposition"].includes("\r"), false);
});

test("login rejects nonexistent accounts and invalid passwords with the same unauthorized result", async () => {
  const argon2 = await import("argon2");
  const { AuthService } = authServiceModule;
  const absent = new AuthService({ findByEmail: async () => null });
  await assert.rejects(absent.login("missing@example.invalid", "guess"), (error) => error.statusCode === 401);
  const passwordHash = await argon2.default.hash("correct-password");
  const wrong = new AuthService({ findByEmail: async () => ({ passwordHash, id: "u", isActive: true, deletedAt: null }) });
  await assert.rejects(wrong.login("user@example.invalid", "wrong"), (error) => error.statusCode === 401);
  for (const account of [
    { passwordHash, id: "inactive", isActive: false, deletedAt: null },
    { passwordHash, id: "deleted", isActive: true, deletedAt: new Date() },
  ]) {
    const ineligible = new AuthService({ findByEmail: async () => account });
    await assert.rejects(ineligible.login("user@example.invalid", "correct-password"), (error) => error.statusCode === 401);
  }
});

test("refresh rejects a missing cookie and logout revokes the token and clears both auth cookies", async () => {
  let revoked = null;
  const controller = new AuthController({ refresh: async () => { throw new httpErrors.UnauthorizedError(); }, logout: async (value) => { revoked = value; } });
  await assert.rejects(controller.refresh({ cookies: {} }, {}), (error) => error.statusCode === 401);
  const cleared = [];
  const res = { clearCookie: (name, options) => cleared.push({ name, options }), status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
  await controller.logout({ cookies: { refreshToken: "refresh-cookie-value" } }, res);
  assert.equal(revoked, "refresh-cookie-value");
  assert.deepEqual(cleared.map(({ name }) => name).sort(), ["accessToken", "refreshToken"]);
  assert.ok(cleared.every(({ options }) => options.httpOnly === true));
});

test("refresh rejects missing, unknown, expired, and revoked tokens and only one concurrent rotation wins", async () => {
  const { AuthService } = authServiceModule;
  const validUser = { id: "user-a", email: "a@example.invalid", phone: null, role: "PATIENT", isVerified: false, isActive: true, deletedAt: null, lastLoginAt: null, onboardingCompletedAt: null, createdAt: new Date(), updatedAt: new Date() };
  const userRepository = { findById: async () => validUser };
  for (const stored of [null, { id: "r", userId: "user-a", revokedAt: new Date(), expiresAt: new Date(Date.now() + 60_000) }, { id: "r", userId: "user-a", revokedAt: null, expiresAt: new Date(Date.now() - 1) }]) {
    const svc = new AuthService(userRepository, { findByTokenHash: async () => stored });
    await assert.rejects(svc.refresh("test-refresh"), (error) => error.statusCode === 401);
  }
  for (const ineligibleUser of [
    { ...validUser, isActive: false },
    { ...validUser, deletedAt: new Date() },
  ]) {
    const svc = new AuthService({ findById: async () => ineligibleUser }, {
      findByTokenHash: async () => ({ id: "r", userId: "user-a", revokedAt: null, expiresAt: new Date(Date.now() + 60_000) }),
      revokeIfActive: async () => ({ count: 1 }),
    });
    await assert.rejects(svc.refresh("ineligible-refresh"), (error) => error.statusCode === 401);
  }
  let active = true;
  let created = 0;
  const stored = { id: "r", userId: "user-a", revokedAt: null, expiresAt: new Date(Date.now() + 60_000) };
  const repo = {
    findByTokenHash: async () => active ? stored : { ...stored, revokedAt: new Date() },
    revokeIfActive: async () => { if (!active) return { count: 0 }; active = false; return { count: 1 }; },
    create: async () => { created += 1; },
  };
  const svc = new AuthService(userRepository, repo);
  const results = await Promise.allSettled([svc.refresh("one"), svc.refresh("two")]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  assert.equal(created, 1);
  await assert.rejects(svc.refresh("replayed"), (error) => error.statusCode === 401);
});

test("logout revokes an active refresh token and repeated logout remains harmless", async () => {
  const { AuthService } = authServiceModule;
  let revoked = 0;
  const svc = new AuthService({}, {
    findByTokenHash: async () => revoked === 0 ? { id: "active-token", revokedAt: null } : { id: "active-token", revokedAt: new Date() },
    revoke: async () => { revoked += 1; },
  });
  await svc.logout("fixture-refresh-token");
  await svc.logout("fixture-refresh-token");
  assert.equal(revoked, 1);
});

test("client-facing authorization errors remain 403 and unauthenticated access remains 401", async () => {
  const patientToken = await token("PATIENT");
  assert.equal((await request("/doctors/applications", { cookie: `accessToken=${patientToken}` })).status, 403);
  assert.equal((await request("/doctors/applications")).status, 401);
});
