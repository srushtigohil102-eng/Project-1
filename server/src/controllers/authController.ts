import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { MOCK_USERS } from "../data/users";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

interface LoginBody {
  email?: string;
  password?: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email?.trim() || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = MOCK_USERS.find(
      (entry) => entry.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
