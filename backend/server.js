require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 8080;

/* Middlewares */
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

/* Test route */
app.get("/", (req, res) => {
  res.json({ status: "Backend is running 🚀" });
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
