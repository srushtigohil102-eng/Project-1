import type { UserRole } from "../middleware/authMiddleware";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

// Password for all demo accounts: Hrms@Dev2026!
const DEMO_PASSWORD_HASH =
  "$2b$10$DRH/mNXtPMKlVavxlx1aG.cNrXTEJHvL1U1mlTfnNqFDW78HeCFjG";

export const MOCK_USERS: MockUser[] = [
  {
    id: "user-hr-001",
    name: "HR Manager",
    email: "hr@company.com",
    role: "hr_manager",
    passwordHash: DEMO_PASSWORD_HASH,
  },
  {
    id: "emp-001",
    name: "John Employee",
    email: "employee@company.com",
    role: "employee",
    passwordHash: DEMO_PASSWORD_HASH,
  },
];
