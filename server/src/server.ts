import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes";
import employeeRoutes from "./routes/employeeRoutes";

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

app.get("/", (_req, res) => {
  res.send("Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
