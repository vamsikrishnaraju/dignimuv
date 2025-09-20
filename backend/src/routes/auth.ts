// backend/src/routes/auth.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const payload = { sub: admin.id, role: admin.role, email: admin.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET ?? "dev-secret", { expiresIn: "8h" });

  return res.json({ accessToken: token, expiresIn: 8 * 3600 });
});

export default router;
