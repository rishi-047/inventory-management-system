import express from "express";
import { getLowStockProducts } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/low-stock", requireAuth, (_request, response) => {
  response.json({
    items: getLowStockProducts()
  });
});

export default router;
