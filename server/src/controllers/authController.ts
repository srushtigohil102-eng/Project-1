import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  res.status(201).json({
    message: "User Registered",
    user: {
      name,
      email,
      password: hashedPassword
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const { email } = req.body;

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login Success",
    token
  });
};