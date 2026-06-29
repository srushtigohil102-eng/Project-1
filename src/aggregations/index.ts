// ============================================
// 1. EMPLOYEE AGGREGATIONS (Analytics Controller)
// ============================================

/**
 * getEmployeesWithDetails
 * -----------------------
 * Joins Employee → Department → Manager using $lookup
 * 
 * @returns {Array} Employees with nested department and manager objects
 * 
 * Collection: employees
 * Pipeline Stages:
 *   - $match: isActive: true, status: "Active"
 *   - $lookup: employees → departments
 *   - $unwind: departmentInfo
 *   - $lookup: employees → employees (self-join for manager)
 *   - $unwind: managerInfo
 *   - $project: Clean nested structure
 *   - $sort: department.name, firstName
 * 
 * Endpoint: GET /api/analytics/employees-details
 */
export const getEmployeesWithDetails = "See analytics.controller.ts";

/**
 * getDepartmentHierarchy
 * ----------------------
 * Groups employees by department with nested employees array
 * 
 * @returns {Array} Departments with employee lists
 * 
 * Collection: employees
 * Pipeline Stages:
 *   - $match: isActive: true
 *   - $lookup: employees → departments
 *   - $unwind: dept
 *   - $group: By department
 *   - $project: Clean structure with employees array
 * 
 * Endpoint: GET /api/analytics/department-hierarchy
 */
export const getDepartmentHierarchy = "See analytics.controller.ts";

/**
 * getOrgChart
 * -----------
 * Builds complete organization hierarchy tree
 * 
 * @returns {Array} Nested org chart with manager-subordinate relationships
 * 
 * Collection: employees
 * Method: Map-based recursive building
 * 
 * Endpoint: GET /api/analytics/org-chart
 */
export const getOrgChart = "See analytics.controller.ts";

/**
 * getEmployeeHierarchy
 * --------------------
 * Gets single employee with manager and team members
 * 
 * @param {string} id - Employee ID
 * @returns {Object} Employee with department, manager, and team
 * 
 * Collection: employees
 * Pipeline Stages:
 *   - $match: _id
 *   - $lookup: department
 *   - $lookup: manager (self-join)
 *   - $lookup: team (subordinates)
 *   - $project: Complete hierarchy
 * 
 * Endpoint: GET /api/analytics/employee-hierarchy/:id
 */
export const getEmployeeHierarchy = "See analytics.controller.ts";


// ============================================
// 2. DEPARTMENT REPORT AGGREGATIONS
// ============================================

/**
 * getDepartmentReports
 * --------------------
 * Department-wise employee and salary statistics
 * 
 * @returns {Object} Company stats + department-wise breakdown
 * 
 * Collection: employees
 * Pipeline:
 *   - $match: isActive: true
 *   - $lookup: department
 *   - $unwind: dept
 *   - $group: By department with:
 *       - totalEmployees
 *       - totalSalary, averageSalary, minSalary, maxSalary
 *       - employees array
 * 
 * Endpoint: GET /api/analytics/department-reports
 */
export const getDepartmentReports = "See analytics.controller.ts";

/**
 * getDepartmentDistribution
 * -------------------------
 * Employee distribution with percentages
 * 
 * @returns {Array} Departments with employeeCount and percentage
 * 
 * Collection: employees
 * Pipeline:
 *   - $match: isActive: true
 *   - $lookup: department
 *   - $unwind: dept
 *   - $group: By department
 *   - Calculate percentages
 * 
 * Endpoint: GET /api/analytics/department-distribution
 */
export const getDepartmentDistribution = "See analytics.controller.ts";


// ============================================
// 3. LEAVE REPORT AGGREGATIONS
// ============================================

/**
 * getDepartmentLeaveReports
 * -------------------------
 * Leave status counts per department
 * 
 * @returns {Object} Overall stats + department-wise leave breakdown
 * 
 * Collection: leaverequests
 * Pipeline:
 *   - $match: Last 6 months
 *   - $lookup: employee
 *   - $unwind: employeeInfo
 *   - $lookup: department
 *   - $unwind: dept
 *   - $group: By department + status
 *   - $group: By department with status counts
 * 
 * Endpoint: GET /api/analytics/department-leave-reports
 */
export const getDepartmentLeaveReports = "See analytics.controller.ts";

/**
 * getPendingLeaveSummary
 * ----------------------
 * Urgent pending leaves with employee details
 * 
 * @returns {Array} Departments with pending leaves and employee details
 * 
 * Collection: leaverequests
 * Pipeline:
 *   - $match: status: "Pending", startDate: >= today
 *   - $lookup: employee
 *   - $unwind: employeeInfo
 *   - $lookup: department
 *   - $unwind: dept
 *   - $group: By department with leaves array
 * 
 * Endpoint: GET /api/analytics/pending-leave-summary
 */
export const getPendingLeaveSummary = "See analytics.controller.ts";

/**
 * getLeaveTypeDistribution
 * ------------------------
 * Leave type breakdown per department
 * 
 * @returns {Array} Departments with leave type counts
 * 
 * Collection: leaverequests
 * Pipeline:
 *   - $match: status: "Approved", last 12 months
 *   - $lookup: employee → department
 *   - $group: By department + leaveType
 *   - $group: By department with leave types array
 * 
 * Endpoint: GET /api/analytics/leave-type-distribution
 */
export const getLeaveTypeDistribution = "See analytics.controller.ts";


// ============================================
// 4. PAYROLL AGGREGATIONS
// ============================================

/**
 * calculateNetPay
 * ---------------
 * Calculates net pay from basic salary, deductions, allowances
 * 
 * @param {string} employeeId - Optional employee filter
 * @param {number} month - Optional month filter
 * @param {number} year - Optional year filter
 * @returns {Array} Payroll records with salary breakdown
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: filters
 *   - $lookup: employee
 *   - $unwind: employeeInfo
 *   - $project: All salary components
 *   - $sort: year, month
 * 
 * Endpoint: GET /api/payroll/calculate-net-pay
 */
export const calculateNetPay = "See payroll.controller.ts";

/**
 * getEmployeePayrollSummary
 * -------------------------
 * Year-to-date payroll summary for an employee
 * 
 * @param {string} employeeId - Employee ID
 * @returns {Object} YTD summary with totals
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: employee, year: current
 *   - $group: By employee with:
 *       - totalGrossSalary, totalNetSalary
 *       - totalTax, totalPF
 *       - averageMonthlyNet
 *       - paidMonths, pendingMonths
 *   - $lookup: employee details
 * 
 * Endpoint: GET /api/payroll/employee-summary/:employeeId
 */
export const getEmployeePayrollSummary = "See payroll.controller.ts";

/**
 * getDepartmentPayrollStats
 * -------------------------
 * Department-wise payroll statistics
 * 
 * @param {number} year - Year filter
 * @param {number} month - Month filter
 * @returns {Object} Department-wise payroll breakdown
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: filters
 *   - $lookup: employee → department
 *   - $group: By department with:
 *       - totalEmployees, totalGrossSalary
 *       - avgGrossSalary, avgNetSalary
 *       - totalTax, totalPF
 * 
 * Endpoint: GET /api/payroll/department-stats
 */
export const getDepartmentPayrollStats = "See payroll.controller.ts";

/**
 * getMonthlyPayrollSummary
 * ------------------------
 * Monthly payroll summary with trends
 * 
 * @param {number} year - Year filter
 * @param {number} month - Month filter
 * @returns {Array} Monthly payroll data
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: filters
 *   - $lookup: employee
 *   - $group: By year + month with totals
 *   - $project: monthName, totals, averages
 * 
 * Endpoint: GET /api/payroll/monthly-summary
 */
export const getMonthlyPayrollSummary = "See payroll.controller.ts";

/**
 * getTopEarners
 * -------------
 * Top earning employees by month/year
 * 
 * @param {number} year - Year filter
 * @param {number} month - Month filter
 * @param {number} limit - Number of results (default: 10)
 * @returns {Array} Top earners with department
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: filters
 *   - $lookup: employee → department
 *   - $sort: netSalary descending
 *   - $limit: 10
 * 
 * Endpoint: GET /api/payroll/top-earners
 */
export const getTopEarners = "See payroll.controller.ts";

/**
 * getTaxBreakdown
 * ---------------
 * Employee-wise tax and deduction breakdown
 * 
 * @param {number} year - Year filter
 * @returns {Object} Tax breakdown with overall stats
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: filters
 *   - $lookup: employee → department
 *   - $group: By employee with:
 *       - totalTax, totalPF, totalProfessionalTax
 *       - effectiveTaxRate
 *   - $sort: totalTax descending
 * 
 * Endpoint: GET /api/payroll/tax-breakdown
 */
export const getTaxBreakdown = "See payroll.controller.ts";

/**
 * getPayrollTrends
 * ----------------
 * Month-over-month payroll trends by department
 * 
 * @param {number} year - Year filter
 * @returns {Array} Department-wise monthly trends
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: year
 *   - $lookup: employee → department
 *   - $group: By department + month
 *   - $group: By department with monthlyData array
 * 
 * Endpoint: GET /api/payroll/trends
 */
export const getPayrollTrends = "See payroll.controller.ts";

/**
 * getPayrollComparison
 * --------------------
 * Month-over-month comparison with percentage changes
 * 
 * @param {number} year - Year filter
 * @returns {Array} Monthly comparison with changes
 * 
 * Collection: payrolls
 * Pipeline:
 *   - $match: year
 *   - $lookup: employee
 *   - $group: By month with totals
 *   - $project: monthName, totals
 *   - Calculate monthOverMonthChange
 * 
 * Endpoint: GET /api/payroll/comparison
 */
export const getPayrollComparison = "See payroll.controller.ts";


// ============================================
// AGGREGATION FUNCTIONS SUMMARY TABLE
// ============================================

export const AGGREGATION_SUMMARY = {
  analytics: {
    employeeAggregations: [
      "getEmployeesWithDetails",
      "getDepartmentHierarchy",
      "getOrgChart",
      "getEmployeeHierarchy"
    ],
    departmentReports: [
      "getDepartmentReports",
      "getDepartmentDistribution"
    ],
    leaveReports: [
      "getDepartmentLeaveReports",
      "getPendingLeaveSummary",
      "getLeaveTypeDistribution"
    ]
  },
  payroll: {
    basicCalculations: [
      "calculateNetPay",
      "getEmployeePayrollSummary"
    ],
    departmentStats: [
      "getDepartmentPayrollStats"
    ],
    reports: [
      "getMonthlyPayrollSummary",
      "getTopEarners",
      "getTaxBreakdown"
    ],
    trends: [
      "getPayrollTrends",
      "getPayrollComparison"
    ]
  }
};

export default {
  AGGREGATION_SUMMARY,
  getEmployeesWithDetails,
  getDepartmentHierarchy,
  getOrgChart,
  getEmployeeHierarchy,
  getDepartmentReports,
  getDepartmentDistribution,
  getDepartmentLeaveReports,
  getPendingLeaveSummary,
  getLeaveTypeDistribution,
  calculateNetPay,
  getEmployeePayrollSummary,
  getDepartmentPayrollStats,
  getMonthlyPayrollSummary,
  getTopEarners,
  getTaxBreakdown,
  getPayrollTrends,
  getPayrollComparison
};