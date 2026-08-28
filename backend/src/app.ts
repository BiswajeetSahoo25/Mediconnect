import { errorMiddleware } from "./middleware/error.middleware.js";
import userRouter from "./routes/user.routes.js";
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json());

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

app.use(errorMiddleware);

export default app;
