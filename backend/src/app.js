import express from "express";
import cors from "cors";
import piRoutes from "./routes/pi.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pi", piRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Backend is running 🚀" });
});

export default app;
