import { Document, Types } from "mongoose";

export type EmployeeRole = "Admin" | "HR" | "Manager" | "Employee";
export type EmployeeStatus = "Active" | "Inactive" | "On Leave" | "Terminated" | "Suspended";
export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";
export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface IBankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}

export interface IEducation {
  degree: string;
  institution: string;
  yearOfPassing: number;
  percentage: number;
}

export interface IWorkExperience {
  company: string;
  designation: string;
  fromDate: Date;
  toDate: Date;
  responsibilities?: string;
}

export interface IEmployee extends Document {
  // Personal Information
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  
  // Professional Information
  password: string;
  role: EmployeeRole;
  department: Types.ObjectId;
  manager?: Types.ObjectId;
  designation: string;
  
  // Financial
  salary: number;
  bankDetails?: IBankDetails;
  panNumber?: string;
  pfNumber?: string;
  uanNumber?: string;
  
  // Personal Details
  dateOfBirth: Date;
  gender: Gender;
  maritalStatus: MaritalStatus;
  address?: IAddress;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  
  // Professional Details
  joiningDate: Date;
  confirmationDate?: Date;
  leavingDate?: Date;
  status: EmployeeStatus;
  
  // Qualifications
  education?: IEducation[];
  workExperience?: IWorkExperience[];
  
  // Documents
  profilePicture?: string;
  resume?: string;
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  
  // System Fields
  isActive: boolean;
  lastLogin?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  
  // Virtuals
  fullName: string;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICreateEmployee {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: EmployeeRole;
  department: string;
  designation: string;
  salary: number;
  dateOfBirth: Date;
  joiningDate: Date;
  gender: Gender;
  maritalStatus?: MaritalStatus;
  address?: IAddress;
  bankDetails?: IBankDetails;
  panNumber?: string;
  manager?: string;
}

export interface IUpdateEmployee {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: EmployeeRole;
  department?: string;
  designation?: string;
  salary?: number;
  manager?: string;
  status?: EmployeeStatus;
  address?: IAddress;
  bankDetails?: IBankDetails;
}