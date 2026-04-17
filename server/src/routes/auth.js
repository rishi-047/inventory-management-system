import express from "express";
import { getUserById, getUserByUsername, sanitizeUser, verifyPassword } from "../db.js";

const router = express.Router();

router.post("/login", (request, response) => {
  const { username, password } = request.body ?? {};

  if (!username || !password) {
    return response.status(400).json({ error: "Username and password are required." });
  }

  const user = getUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return response.status(401).json({ error: "Invalid username or password." });
  }

  if (!user.is_active) {
    return response.status(403).json({ error: "This account is inactive." });
  }

  request.session.user = sanitizeUser(user);
  return response.json({ user: request.session.user });
});

router.post("/logout", (request, response) => {
  request.session.destroy(() => {
    response.json({ ok: true });
  });
});

router.get("/me", (request, response) => {
  if (!request.session.user) {
    return response.status(401).json({ error: "No active session." });
  }

  const freshUser = getUserById(request.session.user.id);
  if (!freshUser || !freshUser.isActive) {
    request.session.destroy(() => {
      response.status(401).json({ error: "Session expired." });
    });
    return;
  }

  request.session.user = freshUser;
  response.json({ user: freshUser });
});

export default router;
