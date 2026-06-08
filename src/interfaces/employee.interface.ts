import { Types } from "mongoose";

export interface IEmployee {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  role:
    | "Admin"
    | "HR"
    | "Manager"
    | "Employee";

  department: Types.ObjectId;

  manager?: Types.ObjectId;

  designation: string;

  salary: number;

  joiningDate: Date;

  status: string;
}