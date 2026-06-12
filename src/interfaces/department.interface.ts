import { Document, Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  departmentHead?: Types.ObjectId;
  budget?: number;
  location?: string;
  phoneNumber?: string;
  email?: string;
  employeeCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateDepartment {
  name: string;
  code: string;
  description?: string;
  departmentHead?: string;
  budget?: number;
  location?: string;
  phoneNumber?: string;
  email?: string;
}

export interface IUpdateDepartment {
  name?: string;
  description?: string;
  departmentHead?: string;
  budget?: number;
  location?: string;
  phoneNumber?: string;
  email?: string;
  isActive?: boolean;
}