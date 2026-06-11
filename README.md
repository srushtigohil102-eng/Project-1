# Project-1

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

Create a `.env` file inside the `server` folder.
Copy from `.env.example` and fill in your values:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

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
