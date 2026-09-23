import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import userRouter from "./modules/users/user.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import patientRouter from "./modules/patients/patient.routes.js";
import emergencyContactRouter from "./modules/patients/patient-emergency-contact.routes.js";
import userAddressRouter from "./modules/users/user-address.routes.js";
import doctorRouter from "./modules/doctors/doctor.routes.js";
import specializationRouter from "./modules/doctors/specialization.routes.js";
import appointmentRouter from "./modules/appointments/appointment.routes.js";
import articleRouter from "./modules/articles/article.routes.js";
import facilityRouter from "./modules/facilities/facility.routes.js";
import medicineRouter from "./modules/medicines/medicine.routes.js";

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
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/facilities", facilityRouter);
app.use("/api/v1/medicines", medicineRouter);

// Handle unmatched routes

app.use(notFoundMiddleware);

// Global error handler

app.use(errorMiddleware);

export default app;
