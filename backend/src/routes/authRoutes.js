import { Router } from "express";
import { createToken, authenticate, resolveUser } from "../auth.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body ?? {};
  let user;

  try {
    user = await resolveUser(username, password);
  } catch (error) {
    next(error);
    return;
  }

  if (!user) {
    return res.status(401).json({ message: "Username atau password salah." });
  }

  const token = createToken(user);

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    },
  });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
