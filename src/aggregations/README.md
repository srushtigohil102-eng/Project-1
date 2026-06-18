# HRMS Aggregation Functions

## 📊 Overview

This document contains all aggregation functions available in the HRMS system. These functions can be wired to API routes by Member A.


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

1. Import the function from the controller:
```typescript
import { functionName } from "../controllers/controllerName";
