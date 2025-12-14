import express from "express";

const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ status: "pi route working ✅" });
});

export default router;
