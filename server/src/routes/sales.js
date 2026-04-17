import express from "express";
import { sellProduct } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, (request, response) => {
  try {
    const { productId, quantitySold } = request.body ?? {};
    const sale = sellProduct(Number(productId), Number(quantitySold), request.session.user.id);
    response.status(201).json({ sale });
  } catch (error) {
    const notFound = error.message === "Product not found.";
    response.status(notFound ? 404 : 400).json({ error: error.message });
  }
});

export default router;
