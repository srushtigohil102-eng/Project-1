# Work Distribution Document

## Enterprise HRMS and Payroll Automation Dashboard

> **Infotact Solutions SDE Internship — Project 3**  
> **Program Duration:** 2 Months (Month 1: Project 3, Month 2: Second Project)  
> **Current Status:** End of Week 3, Month 1  
> **Program Start Date:** 5th June 2026

---

| Attribute | Details |
|-----------|---------|
| **Project Name** | Enterprise HRMS and Payroll Automation Dashboard |
| **Program** | Infotact Solutions SDE Internship — Project 3 |
| **Duration** | 2 Months (Month 1: Project 3, Month 2: Second Project) |
| **Date Range** | 5th June 2026 – 10th July 2026 |
| **Tech Stack** | MongoDB, Express.js, React 19, Node.js, TypeScript |
| **Repository** | [github.com/srushtigohil102-eng/Project-1](https://github.com/srushtigohil102-eng/Project-1) |
| **Mid Review** | 20th – 27th June 2026 |
| **Final Review** | 5th – 10th July 2026 |

---

## Executive Summary

This document outlines the work distribution across the four-member team building the Enterprise HRMS and Payroll Automation Dashboard, a full-stack MERN application with role-based access control for HR Managers and Employees. The frontend is built with React 19, TypeScript, Tailwind CSS v4, and TanStack React Query v5; the backend uses Node.js, Express.js, and MongoDB with Mongoose. The project is tracked on a GitHub Kanban board with 32 issues and uses a CI pipeline with GitHub Actions. Each team member works on a dedicated branch and merges to `main` weekly after Team Lead review.

---

## Team Roles

| Member | Role | Branch | Focus Area |
|--------|------|--------|------------|
| **Member A — Karthika** | Backend Lead | `Karthika` | Express API, JWT authentication, RBAC middleware, payroll endpoints |
| **Member B** | Database & PDF Lead | `member-B` | Mongoose schemas, aggregation pipelines, PDF payslip generation, seed data |
| **Member C — Srushti** | **Frontend Lead + Team Lead** | `Srushti` | React components, routing, state management, UI/UX, CI pipeline, project management |
| **Member D** | DevOps Lead | `member-D` | Docker containerization, CI/CD, integration testing, MongoDB Atlas |

---

## Week-by-Week Contribution

### Member A — Karthika (Backend Lead)

#### Week 1 (5th – 11th June)

- Initialized Node.js Express TypeScript server with complete project structure
- Implemented JWT authentication endpoints (register and login) with token generation
- Added bcrypt password hashing for secure credential storage
- Configured helmet.js for HTTP security headers (XSS, content security, clickjacking)
- Added express-rate-limit for brute force protection on auth routes
- Built `verifyToken` middleware for JWT validation on protected routes
- Built `requireRole` RBAC middleware enforcing HR Manager vs Employee access levels
- Fixed TypeScript configuration issues (`esModuleInterop`, `resolveJsonModule`)
- Configured ESLint v8 with TypeScript parser for code quality
- Tested all authentication and middleware routes using Postman

#### Week 2 (12th – 18th June)

- Built full Employee CRUD API routes (`GET`, `POST`, `PUT`, `DELETE /employees`)
- Built Leave Request routes (`POST /leave/apply`, `PUT /leave/:id/approve`, `PUT /leave/:id/reject`)
- Added zod input validation schemas on all POST and PUT request bodies
- Reviewed and fixed CORS configuration to allow frontend origin requests

#### Week 3 (19th – 24th June)

- Built Payroll API routes (`GET /payroll/:employeeId`, `POST /payroll/run`)
- Protected all payroll routes with HR Manager RBAC middleware
- Built PDF download streaming endpoint (`GET /payroll/:id/download`)
- Implemented payroll calculation logic (basic + allowances – deductions = net pay)
- Added encryption for sensitive payroll fields in the database

---

### Member B (Database & PDF Lead)

#### Week 1 (5th – 11th June)

- Designed MongoDB Mongoose schemas for Employee, Department, LeaveRequest, and PayrollRecord
- Added TypeScript interfaces for all four models with proper type definitions
- Defined relationships between models (Employee references Department and Manager; Payroll references Employee)
- Wrote database seed script using faker.js generating 30+ employees across 5 departments
- Verified schemas integrate correctly with Member A's authentication flow

#### Week 2 (12th – 18th June)

- Wrote `$lookup` aggregation pipeline joining Employee to Department and Manager collections
- Built department-level report aggregation (total employees, average salary, pending leaves per department)
- Wrote payroll calculation aggregation logic (basic salary + allowances – deductions = net pay)

#### Week 3 (19th – 24th June)

- Built PDF payslip generator using pdfkit library
- PDF layout includes: company header, employee information section, earnings table, deductions table, net pay total, month and year
- Returns PDF as a Buffer for Member A's download route to stream to the client
- Built batch payslip generation for entire departments
- Added MongoDB indexes on key query fields (`Employee.department`, `LeaveRequest.status`, `Payroll.month`, `Payroll.year`)
- Tested PDF download end-to-end with Member A's streaming endpoint

---

### Member C — Srushti (Frontend Lead + Team Lead)

#### Week 1 (5th – 11th June)

- Created GitHub repository and set up all 4 member branches (`Srushti`, `Karthika`, `member-B`, `member-D`)
- Created Kanban board with 32 GitHub Issues organized by week (Week 1: #1–#8, Week 2: #9–#16, Week 3: #17–#24, Week 4: #25–#32) with member labels on every issue
- Enabled branch protection rules on `main` requiring PR review before merge
- Added all members as repository collaborators
- Wrote GitHub Actions CI pipeline running build and lint on push/PR
- Initialized Vite + React 19 + TypeScript + Tailwind CSS v4 frontend project
- Built React Router v6 configuration with all 5 page routes
- Built sidebar Layout component with role-based navigation items
- Built login page connected to backend JWT auth API
- Created `useAuth` hook for JWT token management (login, logout, session persistence)
- Built `ProtectedRoute` component with role-based access control (HR Manager vs Employee)
- Built employee table with search, client-side filter, and pagination
- Set up TanStack React Query v5 with global query client configuration
- Created reusable `Avatar` and `StatusBadge` components
- Built `ErrorBoundary` component for graceful error handling
- Built initial dashboard UI with placeholder data cards

#### Week 2 (12th – 18th June)

- Built complete Leave Management UI — apply, approve, reject with role-filtered views
- Built Apply for Leave modal with date validation and working days auto-calculation
- Built HR Manager approve/reject flow with rejection reason modal
- Implemented optimistic updates on leave approval with rollback on API failure
- Built 3-step employee onboarding wizard (Personal Info → Department & Role → Salary & Access)
- Built payslip PDF download button with blob response handling
- Connected dashboard to real API data with skeleton loading and error states
- Added toast notification system using react-hot-toast
- Fixed RBAC bugs found during testing:
  - Dashboard activity feed was showing company-wide data to Employee accounts — restructured into role-specific render blocks
  - Sidebar leave badge was hardcoded to "3" — connected to real `useLeaves()` data with role-based filtering
- Added environment variable configuration for API URL
- Completed full project audit covering RBAC enforcement, security headers, code quality, and data consistency
- Updated README.md with full project documentation, API reference, and setup instructions
- Created Work Distribution Document for Week 2 submission

#### Week 3 (19th – 24th June)

- Connected real payroll calculation data to the payroll table with Indian rupee formatting (`formatIndianCurrency`)
- Added payroll summary footer showing total disbursement amount across all employees
- Added defensive PDF download handling with Content-Type validation, timeout handling, and preview option (opens PDF in new browser tab)
- Added batch payslip download UI with graceful fallback message when endpoint is not ready
- Built reusable `LoadingSpinner` component used across all loading buttons
- Added page fade-in transition animation for smoother navigation experience
- Fixed table column widths jumping during loading state transitions — applied `table-layout: fixed`
- Fixed empty fields showing blank — standardized display with em dash (`—`)
- Added text truncation with tooltip for long department names in tables
- Added "Last updated" timestamp at the bottom of each data table
- Added `formatMonthYear` helper function converting month number and year to readable format (e.g. "June 2026")
- Improved 404 and Access Denied pages with professional, branded design
- Completed full integration testing with real backend — verified all pages with real MongoDB data
- Prepared and submitted Work Distribution Document for Week 3
- Prepared Mid Review demo script and conducted dry run
- Reviewed and merged all team members' Pull Requests each week

---

### Member D (DevOps Lead)

#### Week 1 (5th – 11th June)

- Verified GitHub repository structure and branch protection settings
- Confirmed GitHub Actions CI pipeline configuration and trigger events
- Set up MongoDB Atlas shared database cluster for the team
- Wrote supertest integration tests for authentication routes
- Added integration tests to GitHub Actions CI pipeline to run on every PR

#### Week 2 (12th – 18th June)

- Extended integration test suite covering Employee and Leave endpoints
- Confirmed CI pipeline stays green (passing) after all Week 2 merges to `main`
- Monitored team commit activity and notified members of pipeline failures

#### Week 3 (19th – 24th June)

- Wrote multi-stage Dockerfile for backend: builder stage compiles TypeScript with full SDK, production stage runs compiled JS on `node:20-alpine` for minimal image size
- Wrote Dockerfile for frontend: Vite build output served via nginx
- Wrote `nginx.conf` to handle React Router client-side redirects (SPA fallback)
- Created `docker-compose.yml` orchestrating three services — MongoDB, backend API, and frontend
- Added `.dockerignore` files to both `client/` and `server/` to exclude node_modules and source maps
- Tested full stack end-to-end running from Docker containers

---

## GitHub Activity Evidence

### Repository Structure

| Item | Details |
|------|---------|
| **Repository** | [github.com/srushtigohil102-eng/Project-1](https://github.com/srushtigohil102-eng/Project-1) |
| **Total Issues** | 32 (Week 1: #1–#8, Week 2: #9–#16, Week 3: #17–#24, Week 4: #25–#32) |
| **Kanban Board** | 4 columns (To Do, In Progress, Review, Done) with week labels and member labels |
| **Branch Protection** | `main` branch protected — requires PR review and passing CI checks |
| **CI Status** | GitHub Actions pipeline passing (green) on `main` throughout all 3 weeks |

### Branches

| Branch | Member | Purpose |
|--------|--------|---------|
| `main` | — | Production-ready merged code, reviewed by Team Lead |
| `Srushti` | Member C — Srushti (Frontend + Team Lead) | All frontend development and project management |
| `Karthika` | Member A — Karthika (Backend Lead) | All backend API and middleware development |
| `member-B` | Member B (Database & PDF Lead) | All database schema and PDF generation work |
| `member-D` | Member D (DevOps Lead) | All Docker, CI/CD, and testing work |

### Pull Requests

| Week | Merge Date | Members | Status |
|------|------------|---------|--------|
| **Week 1** | 11th June | All 4 members | ✅ Merged |
| **Week 2** | 18th June | All 4 members | ✅ Merged |
| **Week 3** | 24th June | All 4 members | ✅ Merged |

---

## Task Allocation — Week 4 (Upcoming)

| Member | Week 4 Tasks |
|--------|--------------|
| **Member A — Karthika** | API pagination support, email notification endpoint for payslip delivery, final security review |
| **Member B** | Email attachment integration for payslip PDFs, performance optimization on aggregation pipelines, accessibility improvements |
| **Member C — Srushti** | Full mobile responsive redesign (sidebar collapse, responsive tables), advanced reporting and analytics page, production build optimization, final presentation preparation |
| **Member D** | Production cloud deployment (AWS/Azure/GCP), CI/CD deployment pipeline, SSL certificate setup, final integration test suite |

---

## Team Lead Declaration

I, Srushti, as Team Lead confirm that the above work distribution accurately reflects each member's contribution to the project as evidenced by GitHub commit history and Pull Request records.

---

**Signature:** ____________________________

**Name:** Srushti

**Role:** Frontend Lead + Team Lead

**Date:** 24th June 2026

---

*Document prepared for Infotact Solutions SDE Internship — Project 3 Mid Review*
