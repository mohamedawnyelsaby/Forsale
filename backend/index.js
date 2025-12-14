import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import piRoutes from "./routes/pi.js";
import ordersRoutes from "./routes/orders.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.get("/", (req, res) => {
  res.json({ status: "Forsale API running 🚀" });
});

app.use("/api/pi", piRoutes);
app.use("/api/orders", ordersRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
