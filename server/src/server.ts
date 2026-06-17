import cors from "cors";
import express, { Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import leaveRoutes from "./routes/leaveRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/leave", leaveRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});