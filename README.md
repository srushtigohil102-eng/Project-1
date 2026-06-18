# Project-1

<!-- Member C: Frontend Lead — workspace initialized -->
>>>>>>> a561cb790909236c5d38b2155970eb00c093818c
# HRMS — Human Resource Management System

> Enterprise HR and Payroll Automation Dashboard  
> Infotact Solutions SDE Internship — Project 3

`[CI: Passing]` `[License: MIT]` `[Status: Week 2 Complete]`

---

## What Is This

A full-stack enterprise dashboard for managing employees, leave requests, payroll, and reporting with role-based access control for HR Managers and Employees. Built over 4 weeks by a team of 4 interns using React 19, Node.js, and MongoDB.

---

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 | Node.js 18+ |
| TypeScript 6 | TypeScript 5 |
| Vite 8 | Express.js 4 |
| Tailwind CSS v4 | MongoDB + Mongoose 8 |
| React Router v6 | JWT (jsonwebtoken) |
| TanStack React Query v5 | bcryptjs |
| react-hot-toast | helmet.js |

---

## Team

<<<<<<< HEAD
| Member | Role | Focus Area | Branch |
|--------|------|------------|--------|
| Member A | Backend Lead | Express API, authentication, middleware | `Karthika` |
| Member B | Database & PDF | Mongoose schemas, aggregations, PDF generation | `Himanshi` |
| Member C | **Frontend Lead + Team Lead** | React components, routing, state, UI/UX | `Srushti` |
| Member D | DevOps Lead | CI/CD pipeline, Docker, deployment | `Anoop` |
=======
| Member | Role | Branch |
|--------|------|--------|
| Member A | Backend Lead | Karthika |
| Member B | Database and PDF | Himanshi |
| Member C | Frontend Lead | Srushti |
| Member D | DevOps Lead | Anoop |
>>>>>>> a561cb790909236c5d38b2155970eb00c093818c

---

## Folder Structure

```
Project-1/
├── client/                              # React 19 frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                      # Static assets
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── AddEmployeeModal.tsx      # Multi-step onboarding wizard
│   │   │   ├── ApplyLeaveModal.tsx       # Leave application form
│   │   │   ├── RejectLeaveModal.tsx      # Rejection reason dialog
│   │   │   ├── ConfirmDialog.tsx         # Reusable confirm dialog
│   │   │   ├── StatusBadge.tsx           # Status indicator
│   │   │   ├── Avatar.tsx                # Initials-based avatar
│   │   │   ├── ProtectedRoute.tsx        # Auth + role gate
│   │   │   ├── ApiStatus.tsx             # API health indicator
│   │   │   ├── ErrorBoundary.tsx         # React error boundary
│   │   │   └── DevChecklist.tsx          # Dev-only review tracker
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── useAuth.ts               # Auth context + provider
│   │   │   ├── useEmployees.ts          # Employee queries + mutations
│   │   │   ├── useLeave.ts              # Leave queries + mutations
│   │   │   └── usePayroll.ts            # Payroll queries + mutations
│   │   ├── layouts/
│   │   │   └── Layout.tsx               # Sidebar + main area shell
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx            # JWT login + demo mode
│   │   │   ├── DashboardPage.tsx         # Role-aware dashboard
│   │   │   ├── EmployeesPage.tsx         # Employee table with CRUD
│   │   │   ├── LeavePage.tsx            # Leave management
│   │   │   ├── PayrollPage.tsx          # Payroll + payslip download
│   │   │   ├── ReportsPage.tsx          # Placeholder — Week 3
│   │   │   └── SettingsPage.tsx         # Placeholder — Week 3
│   │   ├── services/
│   │   │   └── apiService.ts            # API functions + _id mapping
│   │   ├── utils/
│   │   │   ├── api.ts                   # Authorized fetch wrapper
│   │   │   ├── authStorage.ts           # Token persistence (session/local)
│   │   │   ├── helpers.ts               # Date formatting, currency, leave calc
│   │   │   ├── toast.ts                 # Toast notification helpers
│   │   │   ├── demoData.ts              # Seed data for demo mode
│   │   │   ├── config.ts                # Environment variables
│   │   │   └── navigation.ts            # Programmatic navigation helper
│   │   ├── styles/
│   │   │   └── constants.ts             # Shared style constants
│   │   ├── App.tsx                      # Root routes + providers
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx                     # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig*.json
│
├── server/                              # Node.js Express backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── employeeController.ts
│   │   │   ├── leaveController.ts
│   │   │   └── payrollController.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts        # JWT verification
│   │   ├── models/                      # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Employee.ts
│   │   │   ├── LeaveRequest.ts
│   │   │   └── PayrollRecord.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── employeeRoutes.ts
│   │   │   ├── leaveRoutes.ts
│   │   │   └── payrollRoutes.ts
│   │   ├── types/
│   │   ├── data/
│   │   │   └── seed.ts                  # Seed script
│   │   └── server.ts                    # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .github/workflows/                   # CI pipeline (Week 3)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed       # Seed the database with test data
npm run dev        # Starts on http://localhost:5000
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
npm run dev        # Starts on http://localhost:5173
```

### Run Both Together

| Service | URL |
|---------|-----|
| Frontend (Vite dev) | http://localhost:5173 |
| Backend API | http://localhost:5000 |

In development, Vite's proxy forwards `/auth`, `/employees`, `/leave`, and `/payroll` requests to the backend. Set `VITE_API_URL` in production builds.

---

## Environment Variables

### Backend (`server/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

### Frontend (`client/.env`)

```
VITE_API_URL=http://localhost:5000
```

---

## Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| **HR Manager** | hr@company.com | Hrms@Dev2026! |
| **Employee** | employee@company.com | Hrms@Dev2026! |

### Demo Mode

When the API is offline, the login page shows demo buttons that log in with pre-loaded mock data:

| Button | Role | Name |
|--------|------|------|
| Continue as HR Manager | `hr_manager` | Rahul Sharma |
| Continue as Employee | `employee` | Priya Nair |

---

## API Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|:-------------:|:-------------:|
| `POST` | `/auth/login` | Log in with email/password | No | — |
| `GET` | `/health` | API health check | No | — |
| `GET` | `/employees` | List all employees | Yes | `hr_manager` |
| `GET` | `/employees/:id` | Get single employee | Yes | `hr_manager` |
| `POST` | `/employees` | Create a new employee | Yes | `hr_manager` |
| `DELETE` | `/employees/:id` | Delete an employee | Yes | `hr_manager` |
| `PUT` | `/employees/:id` | Update an employee | Yes | `hr_manager` |
| `GET` | `/employees/check-email` | Check email availability | Yes | `hr_manager` |
| `GET` | `/leave` | List all leave requests | Yes | — |
| `GET` | `/leave/:id` | Get a single leave request | Yes | — |
| `POST` | `/leave/apply` | Submit a new leave request | Yes | — |
| `PUT` | `/leave/:id/approve` | Approve a leave request | Yes | `hr_manager` |
| `PUT` | `/leave/:id/reject` | Reject a leave request with reason | Yes | `hr_manager` |
| `GET` | `/payroll` | List payroll records | Yes | — |
| `GET` | `/payroll/:employeeId` | Payroll records for one employee | Yes | — |
| `POST` | `/payroll/run` | Run payroll for current month | Yes | `hr_manager` |
| `GET` | `/payroll/:employeeId/download` | Download payslip PDF | Yes | — |

---

## Database Schema Overview

### User

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `name` | String | Full name |
| `email` | String | Unique login email |
| `password` | String | bcrypt-hashed password |
| `role` | String (`employee` / `hr_manager`) | Access control level |
| `createdAt` | Date | Auto-generated |

### Employee

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `name` | String | Full name |
| `email` | String | Unique email |
| `department` | String | Department name |
| `role` | String | Job title |
| `status` | String (`active` / `inactive`) | Employment status |
| `salary` | Number | Annual salary (INR) |
| `createdAt` | Date | Auto-generated |

### LeaveRequest

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `employeeId` | ObjectId | Ref → User |
| `employeeName` | String | Denormalized name |
| `leaveType` | String | Type of leave |
| `fromDate` | Date | Leave start |
| `toDate` | Date | Leave end |
| `reason` | String | User-provided reason |
| `status` | String (`pending` / `approved` / `rejected`) | Current status |
| `rejectReason` | String | Reason if rejected |
| `createdAt` | Date | Auto-generated |

### PayrollRecord

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `employeeId` | ObjectId | Ref → Employee |
| `employeeName` | String | Denormalized name |
| `month` | String | Month name |
| `year` | Number | Year |
| `basicSalary` | Number | Base pay |
| `allowances` | Number | Total allowances |
| `deductions` | Number | Total deductions |
| `netPay` | Number | Take-home amount |

---

## Features

### Authentication & Security

| Feature | Status |
|---------|--------|
| JWT login with token persistence | ✅ Done |
| Role-based route protection (ProtectedRoute) | ✅ Done |
| Session-based token (sessionStorage by default) | ✅ Done |
| "Remember me" (localStorage when checked) | ✅ Done |
| 401 auto-logout on session expiry | ✅ Done |
| Demo mode for offline presentation | ✅ Done |
| Password visibility toggle | ✅ Done |
| Client-side form validation | ✅ Done |

### Employee Management

| Feature | Status |
|---------|--------|
| Employee table with search, filter, pagination | ✅ Done |
| Client-side sorting (name, salary, status) | ✅ Done |
| Multi-step onboarding wizard (3 steps) | ✅ Done |
| Employee detail slide-in panel | ✅ Done |
| Bulk selection + bulk delete | ✅ Done |
| Individual edit/delete | ✅ Done |
| Export selected | 🟡 In Progress |
| Server-side pagination | ⏳ Planned |

### Leave Management

| Feature | Status |
|---------|--------|
| Apply for leave with validated form | ✅ Done |
| Working days auto-calculation (excludes weekends) | ✅ Done |
| Approve/reject with optimistic UI updates | ✅ Done |
| Optimistic update rollback on error | ✅ Done |
| Rejection reason collection | ✅ Done |
| Tab-based filtering (All / Pending / Approved / Processed) | ✅ Done |
| Leave detail slide-in panel | ✅ Done |
| Role-filtered views (HR sees all, Employee sees own) | ✅ Done |
| Leave statistics cards | ✅ Done |
| Pagination | ⏳ Planned |

### Payroll

| Feature | Status |
|---------|--------|
| Month/year navigation | ✅ Done |
| Payroll table with employee details | ✅ Done |
| PDF payslip download | ✅ Done |
| Run payroll (HR Manager only) | ✅ Done |
| Role-filtered records (Employee sees own) | ✅ Done |
| HR summary cards | ✅ Done |
| Payroll confirmation dialog | ✅ Done |
| Advanced reports | ⏳ Planned |
| Automated payslip email | ⏳ Planned |

### Dashboard

| Feature | Status |
|---------|--------|
| Completely separate UI blocks per role | ✅ Done |
| HR: Company stats (employees, leaves, departments, payroll) | ✅ Done |
| HR: Company-wide activity feed | ✅ Done |
| HR: Leave overview with bar chart | ✅ Done |
| HR: Department breakdown with progress bars | ✅ Done |
| Employee: Leave balance (24-day cap) | ✅ Done |
| Employee: Pending requests | ✅ Done |
| Employee: Current salary status | ✅ Done |
| Employee: Years at company | ✅ Done |
| Employee: Personal activity feed | ✅ Done |
| Quick actions per role | ✅ Done |
| Skeleton loading + error + empty states | ✅ Done |
| Partial-error warning banner | ✅ Done |

---

## Role-Based Access Control

The app enforces RBAC at **three levels** — not just conditional button hiding.

### Level 1 — Route Protection

| Route | HR Manager | Employee |
|-------|:----------:|:--------:|
| `/dashboard` | ✅ | ✅ |
| `/employees` | ✅ | ❌ Access Denied |
| `/leave` | ✅ | ✅ |
| `/payroll` | ✅ | ✅ |
| `/reports` | ✅ | ❌ Access Denied |
| `/settings` | ✅ | ❌ Access Denied |

### Level 2 — Data Filtering

| Component | HR Manager | Employee |
|-----------|-----------|----------|
| Dashboard stats | Company-wide totals | Personal stats only |
| Dashboard activity | Everyone's activity | Own activity (`employeeId === user.id`) |
| Leave table | All employees' requests | Own requests only |
| Payroll table | All employees' records | Own records only |
| Sidebar badge | All pending leaves | Own pending leaves |
| Dashboard greeting | Pending leave count | Generic message |

### Level 3 — Action Visibility

| Action | HR Manager | Employee |
|--------|:----------:|:--------:|
| Add / Edit / Delete employees | ✅ | ❌ |
| Bulk select / delete employees | ✅ | ❌ |
| Approve / Reject leaves | ✅ | ❌ |
| Apply for leave | ✅ | ✅ |
| Run payroll | ✅ | ❌ |
| Download payslip | ✅ | ✅ |

---

## Recent Fixes

These issues were found during Week 2 code audit and fixed:

| # | Issue | Fix | Status |
|---|-------|-----|--------|
| 1 | **Dashboard showed company-wide activity to Employees** — Activity feed displayed everyone's data | Restructured into two separate render blocks filtered by `user.id` | ✅ Fixed |
| 2 | **Sidebar badge hardcoded to "3"** — Never reflected real data | Connected to `useLeaves()` with role-based filtering, hidden during loading, capped at "9+" | ✅ Fixed |
| 3 | **"Invalid time value" errors** — Date parsing without NaN checks crashed the dashboard | Added `safeDate()`/`safeTimestamp()` with `isNaN(date.getTime())` guard | ✅ Fixed |
| 4 | **MongoDB _id not mapped** — Some entities used `_id` directly | All entities now pass through `toAppEntity()` for consistent `_id → id` mapping | ✅ Fixed |
| 5 | **Leave approve/reject had no error rollback** — Failed mutations left UI in wrong state | Added optimistic update rollback in `useApproveLeave` | ✅ Fixed |
| 6 | **localStorage used for JWT token** — Session persisted after tab close | Switched to `sessionStorage` by default; "Remember me" checkbox writes to `localStorage` | ✅ Fixed |
| 7 | **formatIndianCurrency duplicated** — Same function in DashboardPage and PayrollPage | Extracted to `utils/helpers.ts` | ✅ Fixed |
| 8 | **No staleTime on React Query** — Data refetched on every component mount | Added `staleTime: 30000` (30s) to all queries | ✅ Fixed |
| 9 | **Dead code in apiService.ts** — 4 exported but unused functions | Removed `checkEmailAvailable`, `updateEmployee`, `getLeaveById`, `downloadPayslip` | ✅ Fixed |

---

## Week-by-Week Progress

| Week | Dates | Status | Key Deliverables |
|------|-------|--------|-----------------|
| **Week 1** | 5th – 11th | ✅ Complete | JWT auth, RBAC, employee table, React Query, sidebar layout |
| **Week 2** | 12th – 18th | ✅ Complete | Leave lifecycle, multi-step onboarding, payroll + PDF, dashboard with live data, bulk actions, optimistic updates, RBAC audit fixes |
| **Week 3** | 19th – 25th | ⏳ In Progress | Mongoose aggregations, reports, GitHub Actions CI, Docker, payslip email, pagination, exporting |
| **Week 4** | 26th – 2nd | ⏳ Planned | Final polish, accessibility audit, deployment, presentation |

---

## Git Workflow

### Branch Naming

| Branch | Member | Purpose |
|--------|--------|---------|
| `main` | — | Production-ready, protected |
| `Karthika/` | Member A | Backend |
| `Himanshi/` | Member B | Database / PDF |
| `Srushti/` | Member C | Frontend |
| `Anoop/` | Member D | DevOps |

### Commit Format

```
<type>: <description> (refs #<issue>)

Types: feat, fix, refactor, chore, docs, style, test
```

---

## Known Limitations

- **No server-side pagination** — Employee and leave tables paginate client-side. With 500+ records, performance will degrade. Planned for Week 3.
- **No automated tests** — Unit and integration tests are planned for Week 3.
- **Email notifications** — Leave approval/rejection and payslip delivery via email not yet implemented.
- **Accessibility** — Keyboard navigation and screen reader support need a final audit pass.
- **Export to CSV/Excel** — The export button on the Employees page is a placeholder.
- **Console.log in api.ts** — Three dev-only `console.log` calls remain; they execute only when `import.meta.env.DEV` is `true`.

---

## Review Schedule

| Event | Date | Status |
|-------|------|--------|
| Mid Review | 20th – 27th June | ⏳ Upcoming |
| Final Review | 5th – 10th July | ⏳ Upcoming |

---

## License

Built as part of an internship project at **Infotact Solutions SDE Internship — Project 3**.  
All rights reserved. This software is for educational and demonstration purposes.
