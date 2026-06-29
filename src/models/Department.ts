import mongoose, { Schema } from "mongoose";
import { IDepartment } from "../interfaces/department.interface";

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, "Department name must be at least 2 characters"],
      maxlength: [50, "Department name cannot exceed 50 characters"],
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, "Department code must be at least 2 characters"],
      maxlength: [10, "Department code cannot exceed 10 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    departmentHead: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: false,
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, "Budget cannot be negative"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]+$/, "Please enter a valid phone number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    employeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
DepartmentSchema.index({ isActive: 1 });
DepartmentSchema.index({ departmentHead: 1 });

// Virtual to populate employees
DepartmentSchema.virtual("employees", {
  ref: "Employee",
  localField: "_id",
  foreignField: "department",
});

// Pre-save middleware to uppercase code
DepartmentSchema.pre("save", function () {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  if (this.name) {
    this.name = this.name.toUpperCase();
  }
});

export const Department = mongoose.model<IDepartment>("Department", DepartmentSchema);