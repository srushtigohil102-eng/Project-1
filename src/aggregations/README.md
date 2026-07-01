# HRMS Aggregation Functions

## 📊 Overview

This document contains all aggregation functions available in the HRMS system. These functions can be wired to API routes by Member A.

## 📂 File Structure
src/
├── aggregations/
│ ├── index.ts # Main export file
│ └── README.md # This documentation
├── controllers/
│ ├── analytics.controller.ts # Analytics aggregations
│ └── payroll.controller.ts # Payroll aggregations
└── routes/
├── analytics.routes.ts # Analytics API routes
└── payroll.routes.ts # Payroll API routes

text

## 📋 Aggregation Categories

### 1. Employee Analytics
| Function | Endpoint | Description |
|----------|----------|-------------|
| `getEmployeesWithDetails` | `/analytics/employees-details` | Employee → Department → Manager join |
| `getDepartmentHierarchy` | `/analytics/department-hierarchy` | Department-wise employee grouping |
| `getOrgChart` | `/analytics/org-chart` | Organization tree structure |
| `getEmployeeHierarchy` | `/analytics/employee-hierarchy/:id` | Single employee with team |

### 2. Department Reports
| Function | Endpoint | Description |
|----------|----------|-------------|
| `getDepartmentReports` | `/analytics/department-reports` | Employee count, salary stats |
| `getDepartmentDistribution` | `/analytics/department-distribution` | Employee distribution % |

### 3. Leave Reports
| Function | Endpoint | Description |
|----------|----------|-------------|
| `getDepartmentLeaveReports` | `/analytics/department-leave-reports` | Leave counts by status |
| `getPendingLeaveSummary` | `/analytics/pending-leave-summary` | Urgent pending leaves |
| `getLeaveTypeDistribution` | `/analytics/leave-type-distribution` | Leave types breakdown |

### 4. Payroll
| Function | Endpoint | Description |
|----------|----------|-------------|
| `calculateNetPay` | `/payroll/calculate-net-pay` | Net pay calculation |
| `getEmployeePayrollSummary` | `/payroll/employee-summary/:id` | YTD payroll summary |
| `getDepartmentPayrollStats` | `/payroll/department-stats` | Department payroll stats |
| `getMonthlyPayrollSummary` | `/payroll/monthly-summary` | Monthly payroll summary |
| `getTopEarners` | `/payroll/top-earners` | Top earners |
| `getTaxBreakdown` | `/payroll/tax-breakdown` | Tax breakdown |
| `getPayrollTrends` | `/payroll/trends` | Payroll trends |
| `getPayrollComparison` | `/payroll/comparison` | Month-over-month comparison |

## 🔧 How to Wire to Routes

### 1. Import the function from the controller:

```typescript
import { functionName } from "../controllers/controllerName";
2. Add route in the routes file:
typescript
router.get("/endpoint-path", functionName);
3. Example - Adding Analytics Routes:
typescript
// In analytics.routes.ts
import { Router } from "express";
import {
  getEmployeesWithDetails,
  getDepartmentHierarchy,
  getOrgChart,
  getEmployeeHierarchy,
  getDepartmentReports,
  getDepartmentDistribution,
  getDepartmentLeaveReports,
  getPendingLeaveSummary,
  getLeaveTypeDistribution
} from "../controllers/analytics.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireManager);

// Employee Aggregations
router.get("/employees-details", getEmployeesWithDetails);
router.get("/department-hierarchy", getDepartmentHierarchy);
router.get("/org-chart", getOrgChart);
router.get("/employee-hierarchy/:id", getEmployeeHierarchy);

// Department Reports
router.get("/department-reports", getDepartmentReports);
router.get("/department-distribution", getDepartmentDistribution);

// Leave Reports
router.get("/department-leave-reports", getDepartmentLeaveReports);
router.get("/pending-leave-summary", getPendingLeaveSummary);
router.get("/leave-type-distribution", getLeaveTypeDistribution);

export default router;
4. Example - Adding Payroll Routes:
typescript
// In payroll.routes.ts
import { Router } from "express";
import {
  calculateNetPay,
  getEmployeePayrollSummary,
  getDepartmentPayrollStats,
  getMonthlyPayrollSummary,
  getTopEarners,
  getTaxBreakdown,
  getPayrollTrends,
  getPayrollComparison
} from "../controllers/payroll.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireManager);

// Payroll Aggregations
router.get("/calculate-net-pay", calculateNetPay);
router.get("/employee-summary/:employeeId", getEmployeePayrollSummary);
router.get("/department-stats", getDepartmentPayrollStats);
router.get("/monthly-summary", getMonthlyPayrollSummary);
router.get("/top-earners", getTopEarners);
router.get("/tax-breakdown", getTaxBreakdown);
router.get("/trends", getPayrollTrends);
router.get("/comparison", getPayrollComparison);

export default router;
🧪 Testing in MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database (hrms_payroll)
3. Select the collection:
For Employee Aggregations → employees

For Leave Aggregations → leaverequests

For Payroll Aggregations → payrolls

4. Click "Aggregations" tab
5. Click "TEXT" button to switch to JSON mode
6. Paste the pipeline stages
7. Click "PREVIEW" or "Run"
Test Query Examples:
Employee Aggregation:
javascript
[
  {
    $match: {
      isActive: true,
      status: "Active"
    }
  },
  {
    $lookup: {
      from: "departments",
      localField: "department",
      foreignField: "_id",
      as: "departmentInfo"
    }
  },
  {
    $unwind: {
      path: "$departmentInfo",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      _id: 1,
      employeeId: 1,
      firstName: 1,
      lastName: 1,
      fullName: { $concat: ["$firstName", " ", "$lastName"] },
      department: {
        name: "$departmentInfo.name",
        code: "$departmentInfo.code"
      }
    }
  }
]
Payroll Aggregation:
javascript
[
  {
    $match: {
      year: 2026
    }
  },
  {
    $group: {
      _id: "$employee",
      totalGrossSalary: { $sum: "$grossSalary" },
      totalNetSalary: { $sum: "$netSalary" },
      averageNetSalary: { $avg: "$netSalary" }
    }
  },
  {
    $lookup: {
      from: "employees",
      localField: "_id",
      foreignField: "_id",
      as: "employeeInfo"
    }
  },
  {
    $unwind: "$employeeInfo"
  },
  {
    $project: {
      employee: {
        fullName: { $concat: ["$employeeInfo.firstName", " ", "$employeeInfo.lastName"] }
      },
      totalGrossSalary: 1,
      totalNetSalary: 1,
      averageNetSalary: { $round: ["$averageNetSalary", 2] }
    }
  }
]
📝 Notes
All aggregations include error handling

Responses follow consistent JSON structure

Role-based access control is applied

All routes require authentication

Use preserveNullAndEmptyArrays: true in $unwind to handle missing references

🔑 Test Credentials
Role	Email	Password
Admin	admin@hrms.com	Admin@123456
HR	maurine.grant@hrms.com	Admin@123456
Manager	candelario.powlowski@eng.com	Admin@123456
Employee	Any employee email	Admin@123456
📊 Aggregation Summary
Category	Functions	Endpoints
Employee Analytics	4	/api/analytics/*
Department Reports	2	/api/analytics/*
Leave Reports	3	/api/analytics/*
Payroll	8	/api/payroll/*
Total	17	-