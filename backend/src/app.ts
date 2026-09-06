import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import patientRouter from "./routes/patient.routes.js";
import emergencyContactRouter from "./routes/patient-emergency-contact.routes.js";
import userAddressRouter from "./routes/user-address.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import specializationRouter from "./routes/specialization.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Mediconnect");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "mediconnect-api",
  });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/users/me/addresses", userAddressRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/patients/me/emergency-contacts", emergencyContactRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/specializations", specializationRouter);
app.use("/api/v1/appointments", appointmentRouter);

app.use(errorMiddleware);

export default app;
