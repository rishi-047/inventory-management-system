import express from "express";
import { createUser, listUsers, updateUserStatus } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAdmin, (_request, response) => {
  response.json({
    users: listUsers()
  });
});

router.post("/", requireAdmin, (request, response) => {
  try {
    const user = createUser(request.body ?? {}, request.session.user.id);
    response.status(201).json({ user });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

router.patch("/:id/status", requireAdmin, (request, response) => {
  try {
    const user = updateUserStatus(
      Number(request.params.id),
      Boolean(request.body?.isActive),
      request.session.user.id
    );
    response.json({ user });
  } catch (error) {
    const notFound = error.message === "User not found.";
    response.status(notFound ? 404 : 400).json({ error: error.message });
  }
});

export default router;
