import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { MOCK_USERS } from "../data/users";

const JWT_SECRET = process.env.JWT_SECRET;

interface LoginBody {
  email?: string;
  password?: string;
}

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT token.
 */
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email?.trim() || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
      return;
    }

    const user = MOCK_USERS.find(
      (entry) =>
        entry.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};