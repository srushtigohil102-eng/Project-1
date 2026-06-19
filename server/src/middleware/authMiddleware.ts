import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "employee" | "hr_manager";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export function verifyToken( 
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (user?.role !== role) {
      res.status(403).json({
        message: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
}
