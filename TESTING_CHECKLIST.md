# Final Testing Checklist — HRMS Application

## 1. Authentication

- [ ] Login page renders correctly at `/` or `/login`
- [ ] Login with valid credentials redirects to dashboard
- [ ] Login with invalid credentials shows error toast
- [ ] "Remember me" persists session across browser close
- [ ] Without "Remember me", session clears on browser close
- [ ] 401 response auto-logs out and redirects to login
- [ ] Demo mode buttons work when API is offline
- [ ] Logout clears session and redirects to login

## 2. Role-Based Access Control

### Admin (admin@hrms.com)
- [ ] Can access all routes: Dashboard, Employees, Leave, Payroll, Reports, Settings
- [ ] Can add/edit/delete employees
- [ ] Can approve/reject leave requests
- [ ] Can run payroll

### HR (hr@company.com)
- [ ] Can access: Dashboard, Employees, Leave, Payroll, Reports
- [ ] Cannot access Settings (should redirect/404)
- [ ] Can add/edit/delete employees
- [ ] Can approve/reject leave requests
- [ ] Can run payroll

### Manager
- [ ] Can access: Dashboard, Leave, Payroll, Reports
- [ ] Cannot access Employees or Settings
- [ ] Cannot add/edit/delete employees
- [ ] Can approve/reject leave requests
- [ ] Can run payroll

### Employee (employee@company.com)
- [ ] Can access: Dashboard, Leave, Payroll
- [ ] Cannot access Employees, Reports, or Settings
- [ ] Cannot add/edit/delete employees
- [ ] Cannot approve/reject leave requests
- [ ] Dashboard shows personal stats only

## 3. Dashboard

- [ ] HR/Admin view shows company-wide stats (employee count, pending leaves, department breakdown, payroll total)
- [ ] Employee view shows personal stats (leave balance, pending requests, salary status, years at company)
- [ ] Greeting changes based on time of day
- [ ] Recent activity feed loads correctly
- [ ] Leave trend chart renders (HR view)
- [ ] Loading skeleton shows during data fetch
- [ ] Partial-error warning banner shows if some data fails

## 4. Employee Management

- [ ] Employee table loads with correct data
- [ ] Search by name/email works
- [ ] Filter by department works
- [ ] Sort by name, salary, status works
- [ ] Pagination (10 per page) works
- [ ] Empty state shows "No employees found" when no data
- [ ] Empty state shows "No results match your search" when filters active but no results
- [ ] Add Employee wizard opens (3 steps)
- [ ] Step 1: First name, last name, email, phone validation works
- [ ] Step 2: Department, designation, joining date validation works
- [ ] Step 3: Salary, role, password validation works (password strength indicator)
- [ ] Form data persists across step navigation
- [ ] Submit shows loading state on button
- [ ] Success toast includes employee name
- [ ] Email duplication is detected and shows error
- [ ] Edit employee works
- [ ] Delete employee shows confirmation dialog
- [ ] Delete button disabled while mutation in flight
- [ ] Bulk select checkboxes work
- [ ] Bulk delete selected employees works

## 5. Leave Management

- [ ] Leave table loads with correct data
- [ ] HR view shows all employees' leaves
- [ ] Employee view shows own leaves only
- [ ] Tab filtering (All / Pending / Approved / Rejected) works
- [ ] Apply for Leave modal opens
- [ ] Leave type, dates, reason validation works
- [ ] Submit button disabled while submitting
- [ ] Success toast shows "Leave request submitted!"
- [ ] Approve leave (HR/Manager) shows toast with employee name
- [ ] Approve button disabled while mutation in flight
- [ ] Reject leave opens rejection reason dialog
- [ ] Rejection reason validation (min 5 chars) works
- [ ] Reject button disabled while mutation in flight
- [ ] Optimistic UI updates reflect immediately

## 6. Payroll

- [ ] Payroll table loads with correct data
- [ ] Month/year navigation works
- [ ] HR view shows all employees' records
- [ ] Employee view shows own records only
- [ ] Summary footer shows total count and disbursement
- [ ] Run Payroll shows confirmation dialog with employee count
- [ ] Run Payroll button loading state works
- [ ] Payslip download works (opens preview)
- [ ] Batch download works with fallback
- [ ] Download button disabled while downloading

## 7. Reports (HR/Admin/Manager)

- [ ] Headcount Overview section loads (total employees, department breakdown)
- [ ] Leave Analytics section loads (type breakdown table, metric cards)
- [ ] Payroll Summary section loads (numbers in ₹ format)
- [ ] Export functionality present
- [ ] All data computed from existing hooks (no new API calls)

## 8. Settings (Admin only)

- [ ] Settings link visible only for Admin role
- [ ] My Profile section shows user details
- [ ] System Configuration toggles work
- [ ] Password form validates (min 8 chars, strength indicator)
- [ ] Danger Zone with ConfirmDialog for destructive actions

## 9. UI/UX

- [ ] Page fade-in transition works on navigation
- [ ] Toast notifications show and auto-dismiss
- [ ] All buttons disabled while their mutation is in flight
- [ ] Loading spinners/skeletons show during data fetch
- [ ] Empty states show contextual messages per page
- [ ] Avatar component shows initials
- [ ] Sidebar highlights active route
- [ ] Responsive layout (test at 1024px+ and mobile widths)

## 10. Error Handling

- [ ] 401 response → auto-logout
- [ ] 403 response → Access Denied message
- [ ] 404 response → Not Found message
- [ ] 500 response → Server Error message
- [ ] Network error → "Unable to connect to server. Please check your connection."
- [ ] Form validation errors show inline
- [ ] Error boundary catches React crashes

## 11. Docker

- [ ] `docker-compose up --build` starts all 3 services
- [ ] Frontend accessible at http://localhost:80
- [ ] API accessible at http://localhost:5000/health
- [ ] Login works against containerized backend
- [ ] All CRUD operations work in containerized environment
