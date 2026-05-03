import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { authDb, recordsDb } from "./db.js";
import { users } from "./users.js";

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: "12h" }
  );
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan." });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid." });
  }
}

export async function resolveUser(username, password) {
  if (!username || !password) {
    return null;
  }

  for (const [label, db] of [
    ["auth", authDb],
    ["records", recordsDb],
  ]) {
    try {
      const user = await db.get(`user:${username}`);
      if (user.password === password) {
        return user;
      }
    } catch (error) {
      if (error.status !== 404) {
        console.error(`Gagal mengambil user dari database ${label}`, error);
      }
    }
  }

  return users.find((user) => user.username === username && user.password === password) || null;
}
