import mongoose, { Schema, HydratedDocument } from "mongoose";
import crypto from "crypto";
import { IEmployee, EmployeeRole, EmployeeStatus, Gender, MaritalStatus } from "../interfaces/employee.interface";

// Helper function to generate employee ID
function generateEmployeeId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `EMP${year}${random}`;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(candidatePassword: string, storedPassword: string): boolean {
  const [salt, key] = storedPassword.split(":");
  if (!salt || !key) {
    return false;
  }
  const derivedKey = crypto.pbkdf2Sync(candidatePassword, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      unique: true,
      default: generateEmployeeId,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    middleName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["Admin", "HR", "Manager", "Employee"] as EmployeeRole[],
        message: "{VALUE} is not a valid role",
      },
      default: "Employee",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    bankDetails: {
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true, uppercase: true },
      bankName: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
    },
    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number"],
    },
    pfNumber: {
      type: String,
      trim: true,
    },
    uanNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other", "Prefer not to say"] as Gender[],
        message: "{VALUE} is not a valid gender",
      },
      required: [true, "Gender is required"],
    },
    maritalStatus: {
      type: String,
      enum: {
        values: ["Single", "Married", "Divorced", "Widowed"] as MaritalStatus[],
        message: "{VALUE} is not a valid marital status",
      },
      default: "Single",
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
      zipCode: { type: String, trim: true },
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
      default: Date.now,
    },
    confirmationDate: {
      type: Date,
    },
    leavingDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive", "On Leave", "Terminated", "Suspended"] as EmployeeStatus[],
        message: "{VALUE} is not a valid status",
      },
      default: "Active",
    },
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        yearOfPassing: { type: Number, required: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    workExperience: [
      {
        company: { type: String, required: true },
        designation: { type: String, required: true },
        fromDate: { type: Date, required: true },
        toDate: { type: Date, required: true },
        responsibilities: { type: String },
      },
    ],
    profilePicture: {
      type: String,
    },
    resume: {
      type: String,
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ role: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ manager: 1 });
EmployeeSchema.index({ joiningDate: -1 });

// Virtual for full name
EmployeeSchema.virtual("fullName").get(function(this: IEmployee) {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving - FIXED VERSION
EmployeeSchema.pre("save", async function(this: HydratedDocument<IEmployee>) {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = hashPassword(this.password);
});

// Compare password method
EmployeeSchema.methods.comparePassword = async function(
  this: IEmployee,
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return verifyPassword(candidatePassword, this.password);
};

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);