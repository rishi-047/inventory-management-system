import express from "express";
import { getDashboardData } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/summary", requireAuth, (_request, response) => {
  response.json(getDashboardData());
});

export default router;
