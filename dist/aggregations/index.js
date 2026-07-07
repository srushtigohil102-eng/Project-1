export const getEmployeesWithDetails = "See analytics.controller.ts";
export const getDepartmentHierarchy = "See analytics.controller.ts";
export const getOrgChart = "See analytics.controller.ts";
export const getEmployeeHierarchy = "See analytics.controller.ts";
export const getDepartmentReports = "See analytics.controller.ts";
export const getDepartmentDistribution = "See analytics.controller.ts";
export const getDepartmentLeaveReports = "See analytics.controller.ts";
export const getPendingLeaveSummary = "See analytics.controller.ts";
export const getLeaveTypeDistribution = "See analytics.controller.ts";
export const calculateNetPay = "See payroll.controller.ts";
export const getEmployeePayrollSummary = "See payroll.controller.ts";
export const getDepartmentPayrollStats = "See payroll.controller.ts";
export const getMonthlyPayrollSummary = "See payroll.controller.ts";
export const getTopEarners = "See payroll.controller.ts";
export const getTaxBreakdown = "See payroll.controller.ts";
export const getPayrollTrends = "See payroll.controller.ts";
export const getPayrollComparison = "See payroll.controller.ts";
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
