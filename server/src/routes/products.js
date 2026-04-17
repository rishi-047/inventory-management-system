import express from "express";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../db.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, (request, response) => {
  const { search, category, sortBy, order } = request.query;
  response.json({
    products: listProducts({ search, category, sortBy, order })
  });
});

router.post("/", requireAdmin, (request, response) => {
  try {
    const product = createProduct(request.body ?? {}, request.session.user.id);
    response.status(201).json({ product });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

router.patch("/:id", requireAdmin, (request, response) => {
  try {
    const product = updateProduct(Number(request.params.id), request.body ?? {}, request.session.user.id);
    response.json({ product });
  } catch (error) {
    const statusCode = error.message === "Product not found." ? 404 : 400;
    response.status(statusCode).json({ error: error.message });
  }
});

router.delete("/:id", requireAdmin, (request, response) => {
  try {
    const product = deleteProduct(Number(request.params.id), request.session.user.id);
    response.json({ product });
  } catch (error) {
    const statusCode = error.message === "Product not found." ? 404 : 400;
    response.status(statusCode).json({ error: error.message });
  }
});

export default router;
