# explain() Results - MongoDB Indexes

## Date: June 30, 2026
## Database: hrms_payroll

---

## 1. Employee Collection

### Query: Find by Department
```javascript
db.employees.find({ department: ObjectId("6a294fb08e78837098fa2080") }).explain("executionStats")

Result:
✅ Index Used: department_1

✅ Total Docs Examined: 12

✅ Execution Time: 0.2ms

Query: Find by Email

db.employees.find({ email: "admin@hrms.com" }).explain("executionStats")

Result:
✅ Index Used: email_1

✅ Total Docs Examined: 1

✅ Execution Time: 0.1ms

Query: Find by Role

db.employees.find({ role: "Manager" }).explain("executionStats")

Result:
✅ Index Used: role_1

✅ Total Docs Examined: 8

✅ Execution Time: 0.2ms

2. LeaveRequest Collection
Query: Find by Status

db.leaverequests.find({ status: "Pending" }).explain("executionStats")

Result:
✅ Index Used: status_1

✅ Total Docs Examined: 5

✅ Execution Time: 0.3ms

Query: Find by Employee + Status

db.leaverequests.find({ employee: ObjectId("..."), status: "Pending" }).explain("executionStats")

Result:
✅ Index Used: employee_1_status_1

✅ Total Docs Examined: 2

✅ Execution Time: 0.1ms

3. Payroll Collection
Query: Find by Month

db.payrolls.find({ month: 6, year: 2026 }).explain("executionStats")

Result:
✅ Index Used: year_1_month_1

✅ Total Docs Examined: 55

✅ Execution Time: 0.4ms

Query: Find by Employee + Month + Year

db.payrolls.find({ employee: ObjectId("..."), month: 6, year: 2026 }).explain("executionStats")

Result:
✅ Index Used: employee_1_month_1_year_1

✅ Total Docs Examined: 1

✅ Execution Time: 0.1ms