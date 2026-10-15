import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import express from "express";

import { AppError } from "../dist/errors/app-error.js";
import { errorMiddleware } from "../dist/middleware/error.middleware.js";

async function requestToErrorRoute(error) {
  const app = express();
  app.use(express.json());
  app.post("/unexpected", (_req, _res, next) => next(error));
  app.use(errorMiddleware);

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  assert.ok(address && typeof address === "object");

  try {
    const response = await fetch(
      `http://127.0.0.1:${address.port}/unexpected?query_secret=do-not-log`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer do-not-log-this-token",
          cookie: "session=do-not-log-this-cookie",
        },
        body: JSON.stringify({ privateBody: "do-not-log-this-body" }),
      },
    );

    return {
      status: response.status,
      body: await response.json(),
    };
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve(undefined)));
    });
  }
}

test("unexpected errors return a generic 500 and log safe request diagnostics", async (t) => {
  const logs = [];
  t.mock.method(console, "error", (...args) => logs.push(args));

  const originalMessage = "database password=secret; relation private_users missing";
  const originalStack = `${originalMessage}\n    at C:\\internal\\private\\database.js:42:7`;
  const error = new Error(originalMessage);
  error.stack = originalStack;

  const response = await requestToErrorRoute(error);

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, {
    status: "error",
    message: "Internal server error",
  });
  assert.equal(Object.hasOwn(response.body, "error"), false);
  assert.equal(JSON.stringify(response.body).includes(originalMessage), false);
  assert.equal(JSON.stringify(response.body).includes(originalStack), false);

  assert.equal(logs.length, 1);
  assert.equal(logs[0][0], "Unhandled request error");
  assert.deepEqual(logs[0][1], {
    method: "POST",
    path: "/unexpected",
    errorName: "Error",
    message: originalMessage,
    stack: originalStack,
  });

  const serializedLogs = JSON.stringify(logs);
  for (const secret of [
    "do-not-log",
    "do-not-log-this-token",
    "do-not-log-this-cookie",
    "do-not-log-this-body",
  ]) {
    assert.equal(serializedLogs.includes(secret), false);
  }
});

test("non-Error thrown values are logged by type without serializing the value", async (t) => {
  const logs = [];
  t.mock.method(console, "error", (...args) => logs.push(args));

  const response = await requestToErrorRoute({ password: "do-not-log-this-object" });

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, {
    status: "error",
    message: "Internal server error",
  });
  assert.deepEqual(logs, [
    [
      "Unhandled non-Error value",
      {
        method: "POST",
        path: "/unexpected",
        errorName: "NonErrorThrownValue",
        message: "Non-Error thrown value (type: object)",
      },
    ],
  ]);
  assert.equal(JSON.stringify(logs).includes("do-not-log-this-object"), false);
});

test("known AppError responses retain status, message, and details", async (t) => {
  const logs = [];
  t.mock.method(console, "error", (...args) => logs.push(args));

  const error = new AppError("Validation failed", 422, true, {
    fields: ["email"],
  });
  const response = await requestToErrorRoute(error);

  assert.equal(response.status, 422);
  assert.deepEqual(response.body, {
    status: "error",
    message: "Validation failed",
    details: { fields: ["email"] },
  });
  assert.equal(logs.length, 0);
});
