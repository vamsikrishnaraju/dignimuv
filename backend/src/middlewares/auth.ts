// backend/src/middlewares/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  admin?: any;
}

export const ensureAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "missing authorization" });
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "invalid authorization format" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "dev-secret");
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
};
