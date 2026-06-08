import mongoose, { Schema } from "mongoose";

const EmployeeSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Admin", "HR", "Manager", "Employee"],
      default: "Employee",
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },

    designation: String,

    salary: Number,

    joiningDate: Date,

    status: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Employee", EmployeeSchema);

