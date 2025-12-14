import express from "express";

const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ pi: "ok" });
});

export default router;
