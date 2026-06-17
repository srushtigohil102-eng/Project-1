<!-- Member C: Frontend Lead — workspace initialized -->
# HRMS — Human Resource Management System

> Enterprise HR and Payroll Automation Dashboard  

---

## What is this project

This is a full stack web application that helps companies 
manage their employees, leaves, and payroll in one place.

Two types of users can use this system:
- **HR Manager** — can add employees, approve leaves, run payroll
- **Employee** — can apply for leave and download their payslip

---

## Features

### Week 1 — Core Foundation
- [x] Secure JWT login (HR Manager + Employee)
- [x] Role-based access control (ProtectedRoute)
- [x] Employee table with search, filter, and pagination
- [x] React Query integration for server state management
- [x] Responsive sidebar layout with navigation

### Week 2 — Leave, Onboarding & Payroll
- [x] Leave management system with apply / approve / reject
- [x] Multi-step employee onboarding form (3-step wizard)
- [x] Payslip PDF download
- [x] Dashboard connected to real-time API data
- [x] Employee search, filter, sort, and bulk actions
- [x] Toast notifications for all user actions
- [x] Optimistic updates on leave approve/reject

### Week 3 — Planned (upcoming)
- [ ] Advanced Mongoose aggregations for reports (Member B)
- [ ] GitHub Actions CI with full test suite
- [ ] Docker setup for backend and frontend
- [ ] Payslip email delivery
- [ ] Pagination and export improvements

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React 19, Vite 7, TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| State Management | React Query (TanStack Query) |
| PDF Generation | pdfkit |
| DevOps | Docker, GitHub Actions CI/CD |

---

## Project Structure
hrms-project/
client/          → React 19 frontend (Member C)
server/          → Node.js Express backend (Member A)
.github/
workflows/     → GitHub Actions CI pipeline (Member D)
docker-compose.yml
README.md

---

## Team

| Member | Role | Branch |
|--------|------|--------|
| Member A | Backend Lead | Karthika |
| Member B | Database and PDF | Himanshi |
| Member C | Frontend Lead | Srushti |
| Member D | DevOps Lead | Anoop |

---

## Week-wise Progress

| Week | Dates | Status |
|------|-------|--------|
| Week 1 | 5th – 11th | ✅ Complete |
| Week 2 | 12th – 18th | ✅ Complete |
| Week 3 | 19th – 25th | 🔄 In Progress |

---

## Week 2 Highlights

**What was built in Week 2 (12th – 18th):**

- **Leave Management System** — Full-featured leave lifecycle: employees apply for leave via a validated modal, HR managers approve or reject with a reject reason, tabs filter by status, and a detail slide-over panel shows full leave information. Optimistic updates give instant feedback on approve/reject actions.
- **Multi-Step Onboarding Wizard** — A 3-step employee creation form (Personal Info → Employment → Compensation) with back navigation that preserves all entered data, email availability validation on blur, and a final submit that merges all steps into a single API call.
- **Payslip Download** — Download buttons on each payroll row trigger PDF downloads via the backend, with loading states and error handling for network failures.
- **Dashboard Connected to Real Data** — The dashboard now pulls live data from the API for employee counts, leave stats, payroll summaries, and recent activity, replacing all hardcoded mock data with React Query hooks.
- **Bulk Operations & Polish** — Bulk selection and bulk delete on the employees table, consistent toast notifications across all actions, edge case handling for empty states and API errors, and demo mode for offline testing.

---

## Known Limitations

These items are intentionally deferred to Week 3 or Week 4 and reflect planned iteration rather than incomplete work:

- **Email notifications** — Leave approval/rejection emails are planned but not yet implemented (payslip email delivery is also on the roadmap)
- **Advanced payroll reports** — Department-wise cost breakdowns and year-over-year comparisons are scheduled for Week 3 with Mongoose aggregation pipelines
- **CI/CD pipeline** — GitHub Actions workflows are configured for linting but the full test suite and deployment automation will be wired in Week 3
- **Docker containerization** — The application currently runs locally; Docker Compose for both frontend and backend is planned
- **Export to CSV/Excel** — The export button on the Employees page is currently a placeholder; full CSV and Excel export will be added in a future sprint
- **Accessibility audit** — Keyboard navigation and screen reader compatibility improvements are scheduled for the final polish sprint

---

## How to run the project locally

### Requirements
Make sure you have these installed:
- Node.js version 18 or above
- MongoDB (local or Atlas connection)
- Git

### Step 1 — Clone the repository
```bash
git clone https://github.com/srushtigohil102-eng/Project-1
cd project-1
```

### Step 2 — Set up the backend
```bash
cd server
npm install
cp .env.example .env
# Fill in your MongoDB URL and JWT secret in .env
npm run dev
```

### Step 3 — Set up the frontend
```bash
cd client
npm install
npm run dev
```

### Step 4 — Open the app

Frontend → http://localhost:5173
Backend  → http://localhost:5000

---

## Environment Variables

### Backend (server/.env)
Copy from `.env.example` and fill in your values:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### Frontend (client/.env)
Create a `.env` file inside the `client` folder:
```
VITE_API_URL=http://localhost:5000
```
`VITE_API_URL` sets the backend API base URL. In development this defaults to the Vite proxy; set it to your deployed backend URL in production.

---

## Test Credentials

After running the seed script, use these to log in:

HR Manager:
Email:    hr@company.com
Password: password123

Employee:
Email:    employee@company.com
Password: password123

To run the seed script:
```bash
cd server
npm run seed
```

---
