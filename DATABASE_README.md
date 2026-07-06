# 📊 HRMS Database Documentation

## 📋 Overview

This document provides complete documentation for the HRMS (Human Resource Management System) database design, schemas, relationships, and setup instructions.

**Database:** MongoDB  
**ODM:** Mongoose  
**Version:** 1.0.0

---

## 🗂️ Database Schema Design

### 1. Department Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Department name (unique, uppercase) |
| `code` | String | ✅ | Department code (unique, uppercase) |
| `description` | String | ❌ | Department description |
| `departmentHead` | ObjectId | ❌ | Reference to Employee (department head) |
| `budget` | Number | ❌ | Annual budget (default: 0) |
| `location` | String | ❌ | Office location |
| `phoneNumber` | String | ❌ | Department contact number |
| `email` | String | ❌ | Department email |
| `employeeCount` | Number | ❌ | Auto-updated employee count |
| `isActive` | Boolean | ❌ | Soft delete flag (default: true) |

**Indexes:** `name`, `code`, `isActive`, `departmentHead`

**Example Document:**
```json
{
  "name": "ENGINEERING",
  "code": "ENG",
  "description": "Software development and technical operations",
  "departmentHead": "ObjectId('...')",
  "budget": 5000000,
  "location": "Floor 3, Tower A",
  "isActive": true
}

2. Employee Schema


Indexes: employeeId, email, department, role, status, manager, joiningDate

Virtual: fullName (firstName + lastName)

Methods: comparePassword()

Example Document:

json
{
  "employeeId": "EMP2026001",
  "firstName": "System",
  "lastName": "Administrator",
  "email": "admin@hrms.com",
  "role": "Admin",
  "department": "ObjectId('...')",
  "designation": "System Administrator",
  "salary": 250000,
  "status": "Active"
}

3. LeaveRequest Schema


Methods: calculateDays()

Example Document:

json
{
  "employee": "ObjectId('...')",
  "leaveType": "Annual",
  "startDate": "2026-07-10",
  "endDate": "2026-07-15",
  "numberOfDays": 6,
  "reason": "Family vacation",
  "status": "Pending"
}
4. Payroll Schema

Example Document:
json
{
  "employee": "ObjectId('...')",
  "month": 6,
  "year": 2026,
  "salaryBreakdown": {
    "basic": 250000,
    "hra": 100000,
    "da": 25000
  },
  "grossSalary": 375000,
  "deductionBreakdown": {
    "tax": 15000,
    "providentFund": 30000
  },
  "totalDeductions": 45000,
  "netSalary": 330000,
  "status": "Paid"
}
🔗 Database Relationships
text
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │  Department  │         │   Employee   │                      │
│  ├──────────────┤         ├──────────────┤                      │
│  │ _id          │◄────────│ department   │ (Many-to-One)        │
│  │ name         │         │ manager      │──┐                   │
│  │ code         │         │ _id          │◄─┘ (Self-Reference)  │
│  │ departmentHead│────────│              │                      │
│  └──────────────┘         └──────────────┘                      │
│                                    │                            │
│                                    │                            │
│                                    ▼                            │
│                           ┌──────────────┐                      │
│                           │   Payroll    │                      │
│                           ├──────────────┤                      │
│                           │ employee     │ (Many-to-One)        │
│                           │ month        │                      │
│                           │ year         │                      │
│                           │ netSalary    │                      │
│                           └──────────────┘                      │
│                                    │                            │
│                                    │                            │
│                                    ▼                            │
│                           ┌──────────────┐                      │
│                           │ LeaveRequest │                      │
│                           ├──────────────┤                      │
│                           │ employee     │ (Many-to-One)        │
│                           │ approvedBy   │──┐                   │
│                           │ leaveType    │  │ (Self-Reference)  │
│                           │ status       │◄─┘                   │
│                           └──────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
Relationship Summary

Relationship	Type	Reference
Employee → Department	Many-to-One	department → Department._id
Employee → Manager	Self-Reference	manager → Employee._id
Payroll → Employee	Many-to-One	employee → Employee._id
LeaveRequest → Employee	Many-to-One	employee → Employee._id
LeaveRequest → ApprovedBy	Self-Reference	approvedBy → Employee._id
Department → DepartmentHead	One-to-One	departmentHead → Employee._id


🚀 How to Run the Seed Script

Prerequisites
Node.js installed (v18+)

MongoDB running locally or in cloud

Environment variables configured

Step 1: Install Dependencies
bash
npm install
Step 2: Configure Environment
Create .env file:

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms_payroll
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
Step 3: Run the Seed Script


bash
npm run seed


Expected Output
text
🚀 Starting Enterprise HRMS Database Seeding...
============================================================
✅ MongoDB Connected Successfully
📦 Database: hrms_payroll

🗑️  Clearing existing data...
✅ All existing data cleared

📁 Creating departments...
  ✅ ENG - ENGINEERING
  ✅ HR - HUMAN RESOURCES
  ✅ SALES - SALES
  ✅ MKT - MARKETING
  ✅ FIN - FINANCE
  ✅ OPS - OPERATIONS
  ✅ PROD - PRODUCT
  ✅ CS - CUSTOMER SUPPORT
  Total: 8 departments created

👥 Creating employees...
  ✅ ADMIN: System Administrator (admin@hrms.com)
  ✅ HR: Maurine Grant (maurine.grant@hrms.com)
  ✅ HR: Haskell Streich (haskell.streich@hrms.com)
  ✅ MANAGER (ENG): Candelario Powlowski
  ✅ MANAGER (HR): Kay Steuber
  ... (more employees)

  📊 Total employees created: 55
     - Admin: 1
     - HR: 2
     - Managers: 8
     - Employees: 44

👔 Assigning department heads...
  ✅ ENG department head: System Administrator
  ✅ HR department head: Kay Steuber
  ... (all departments)

📅 Creating leave requests...
  ✅ Total leave requests created: 90+

💰 Creating payroll records...
  ✅ Total payroll records created: 330+

============================================================
🎉 ENTERPRISE HRMS DATABASE SEEDING COMPLETED!
============================================================

📊 FINAL SUMMARY:
  🏢 Departments: 8
  👥 Employees: 55
  📅 Leave Requests: 90+
  💰 Payroll Records: 330+

🔑 DEFAULT LOGIN CREDENTIALS:
  Email: admin@hrms.com
  Password: Admin@123456


Seed Data Statistics
Collection	Records	Description
Departments	8	Engineering, HR, Sales, Marketing, Finance, Operations, Product, Customer Support
Employees	55+	1 Admin, 2 HR, 8 Managers, 44 Employees
Leave Requests	90+	Various leave types with different statuses
Payroll Records	330+	Last 6 months of payroll data


🔑 Default Login Credentials
Role	Email	Password
Admin	admin@hrms.com	Admin@123456
HR	Any HR email	Admin@123456
Manager	Any Manager email	Admin@123456
Employee	Any Employee email	Admin@123456


📊 Database Indexes

Employee Collection
Index	Fields	Type
_id_	_id	Primary
employeeId_1	employeeId	Unique
email_1	email	Unique
department_1	department	Regular
role_1	role	Regular
status_1	status	Regular
manager_1	manager	Regular
joiningDate_-1	joiningDate	Descending
LeaveRequest Collection
Index	Fields	Type
_id_	_id	Primary
employee_1_status_1	employee, status	Compound
startDate_-1_endDate_-1	startDate, endDate	Compound
status_1_appliedAt_-1	status, appliedAt	Compound
Payroll Collection
Index	Fields	Type
_id_	_id	Primary
employee_1_month_1_year_1	employee, month, year	Unique Compound
status_1_paymentDate_-1	status, paymentDate	Compound
year_1_month_1	year, month	Compound


🧪 Verify Indexes
Run the verification script:

bash
npm run verify-indexes

Aggregation Functions (14 Total)

Category	            Function

Employee Analytics  	getEmployeesWithDetails , getOrgChart ,getEmployeeHierarchy

Leave Reports	        getDepartmentLeaveReports , getPendingLeaveSummary ,getLeaveTypeDistribution

Payroll Reports	        calculateNetPay , getEmployeePayrollSummary ,getDepartmentPayrollStats ,getMonthlyPayrollSummary ,getTopEarners , getTaxBreakdown , getPayrollTrends
