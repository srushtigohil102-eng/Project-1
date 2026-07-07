import { z } from "zod";
import { type Request, type Response, type NextFunction } from "express";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  salary: z.number().positive("Salary must be positive"),
}).passthrough();

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  salary: z.number().positive().optional(),
});

type ZodSchema = z.ZodSchema;

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      res.status(400).json({ success: false, message: "Validation failed", errors });
      return;
    }
    req.body = result.data;
    next();
  };
};
