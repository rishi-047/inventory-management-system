import express from "express";
import { listActivity } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, (request, response) => {
  const limit = Number(request.query.limit ?? 12);
  response.json({
    items: listActivity(Number.isNaN(limit) ? 12 : limit)
  });
});

export default router;
