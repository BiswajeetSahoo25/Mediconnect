import userRouter from "./routes/user.routes.js";
import express from "express";

const app = express();

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

app.use("/api/v1/users", userRouter)

export default app;
