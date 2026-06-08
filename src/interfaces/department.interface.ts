import { Types } from "mongoose";

export interface IDepartment {
  name: string;
  description?: string;
  departmentHead?: Types.ObjectId;
}