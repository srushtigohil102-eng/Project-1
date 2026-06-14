import { Request, Response } from "express";
import { Employee } from "../models/Employee";
import mongoose from "mongoose";


// Get employees with department and manager details using aggregation
export const getEmployeesWithDetails = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Employee.aggregate([
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
        $lookup: {
          from: "employees",
          localField: "manager",
          foreignField: "_id",
          as: "managerInfo"
        }
      },
      {
        $unwind: {
          path: "$managerInfo",
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
          email: 1,
          phoneNumber: 1,
          designation: 1,
          salary: 1,
          joiningDate: 1,
          status: 1,
          department: {
            _id: "$departmentInfo._id",
            name: "$departmentInfo.name",
            code: "$departmentInfo.code",
            description: "$departmentInfo.description",
            location: "$departmentInfo.location",
            budget: "$departmentInfo.budget"
          },
          manager: {
            _id: "$managerInfo._id",
            employeeId: "$managerInfo.employeeId",
            firstName: "$managerInfo.firstName",
            lastName: "$managerInfo.lastName",
            fullName: { $concat: ["$managerInfo.firstName", " ", "$managerInfo.lastName"] },
            email: "$managerInfo.email",
            designation: "$managerInfo.designation"
          },
          createdAt: 1,
          updatedAt: 1
        }
      },
      {
        $sort: {
          "department.name": 1,
          firstName: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch employees with details", 
      error: (error as Error).message 
    });
  }
};

// Get department-wise employee count with nested structure
export const getDepartmentHierarchy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Employee.aggregate([
      {
        $match: {
          isActive: true
        }
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "dept"
        }
      },
      {
        $unwind: {
          path: "$dept",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$dept._id",
          departmentName: { $first: "$dept.name" },
          departmentCode: { $first: "$dept.code" },
          departmentDescription: { $first: "$dept.description" },
          totalEmployees: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
          avgSalary: { $avg: "$salary" },
          employees: {
            $push: {
              _id: "$_id",
              employeeId: "$employeeId",
              firstName: "$firstName",
              lastName: "$lastName",
              fullName: { $concat: ["$firstName", " ", "$lastName"] },
              designation: "$designation",
              salary: "$salary"
            }
          }
        }
      },
      {
        $sort: {
          departmentName: 1
        }
      },
      {
        $project: {
          department: {
            _id: "$_id",
            name: "$departmentName",
            code: "$departmentCode",
            description: "$departmentDescription"
          },
          totalEmployees: 1,
          totalSalary: 1,
          avgSalary: { $round: ["$avgSalary", 2] },
          employees: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error("Department hierarchy error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch department hierarchy", 
      error: (error as Error).message 
    });
  }
};

// Get complete org chart with manager hierarchy
export const getOrgChart = async (_req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find({ isActive: true })
      .select("_id employeeId firstName lastName designation manager")
      .lean();
    
    const employeeMap = new Map();
    const managers = new Set();
    
    employees.forEach(emp => {
      employeeMap.set(emp._id.toString(), {
        _id: emp._id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        fullName: `${emp.firstName} ${emp.lastName}`,
        designation: emp.designation,
        team: []
      });
    });
    
    employees.forEach(emp => {
      if (emp.manager) {
        const managerId = emp.manager.toString();
        if (employeeMap.has(managerId)) {
          employeeMap.get(managerId).team.push(employeeMap.get(emp._id.toString()));
          managers.add(managerId);
        }
      }
    });
    
    const orgChart = employees
      .filter(emp => !emp.manager || !managers.has(emp._id.toString()))
      .map(emp => employeeMap.get(emp._id.toString()))
      .filter(emp => emp);
    
    res.status(200).json({
      success: true,
      count: orgChart.length,
      data: orgChart
    });
  } catch (error) {
    console.error("Org chart error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch organization chart", 
      error: (error as Error).message 
    });
  }
};

// Get employee with complete hierarchy (including team members)
export const getEmployeeHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid employee ID" });
      return;
    }
    
    const result = await Employee.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isActive: true
        }
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department"
        }
      },
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "manager",
          foreignField: "_id",
          as: "manager"
        }
      },
      {
        $unwind: {
          path: "$manager",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "manager",
          as: "team"
        }
      },
      {
        $project: {
          _id: 1,
          employeeId: 1,
          firstName: 1,
          lastName: 1,
          fullName: { $concat: ["$firstName", " ", "$lastName"] },
          email: 1,
          phoneNumber: 1,
          designation: 1,
          salary: 1,
          department: {
            _id: "$department._id",
            name: "$department.name",
            code: "$department.code"
          },
          manager: {
            _id: "$manager._id",
            employeeId: "$manager.employeeId",
            fullName: { $concat: ["$manager.firstName", " ", "$manager.lastName"] },
            designation: "$manager.designation"
          },
          team: {
            $map: {
              input: "$team",
              as: "member",
              in: {
                _id: "$$member._id",
                employeeId: "$$member.employeeId",
                firstName: "$$member.firstName",
                lastName: "$$member.lastName",
                fullName: { $concat: ["$$member.firstName", " ", "$$member.lastName"] },
                designation: "$$member.designation",
                joiningDate: "$$member.joiningDate"
              }
            }
          },
          teamCount: { $size: "$team" },
          status: 1,
          joiningDate: 1,
          createdAt: 1
        }
      }
    ]);
    
    if (!result || result.length === 0) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error("Employee hierarchy error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch employee hierarchy", 
      error: (error as Error).message 
    });
  }
};

//  DEPARTMENT REPORTS 

// Get department reports: total employees, average salary, min/max salary
export const getDepartmentReports = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Employee.aggregate([
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
          as: "dept"
        }
      },
      {
        $unwind: {
          path: "$dept",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$dept._id",
          departmentName: { $first: "$dept.name" },
          departmentCode: { $first: "$dept.code" },
          totalEmployees: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
          averageSalary: { $avg: "$salary" },
          minSalary: { $min: "$salary" },
          maxSalary: { $max: "$salary" },
          employees: {
            $push: {
              _id: "$_id",
              employeeId: "$employeeId",
              fullName: { $concat: ["$firstName", " ", "$lastName"] },
              designation: "$designation",
              salary: "$salary"
            }
          }
        }
      },
      {
        $addFields: {
          averageSalary: { $round: ["$averageSalary", 2] }
        }
      },
      {
        $sort: { departmentName: 1 }
      },
      {
        $project: {
          _id: 0,
          department: {
            _id: "$_id",
            name: "$departmentName",
            code: "$departmentCode"
          },
          totalEmployees: 1,
          totalSalaryBudget: "$totalSalary",
          averageSalary: 1,
          minSalary: 1,
          maxSalary: 1,
          employees: 1
        }
      }
    ]);
    
    const companyStats = {
      totalEmployees: result.reduce((sum, dept) => sum + dept.totalEmployees, 0),
      totalSalaryBudget: result.reduce((sum, dept) => sum + dept.totalSalaryBudget, 0),
      overallAverageSalary: result.length > 0 
        ? (result.reduce((sum, dept) => sum + dept.averageSalary, 0) / result.length).toFixed(2)
        : 0,
      departmentsCount: result.length
    };
    
    res.status(200).json({
      success: true,
      companyStats,
      departments: result
    });
  } catch (error) {
    console.error("Department reports error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch department reports", 
      error: (error as Error).message 
    });
  }
};

// Get department-wise employee distribution
export const getDepartmentDistribution = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Employee.aggregate([
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
          as: "dept"
        }
      },
      {
        $unwind: {
          path: "$dept",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$dept._id",
          name: { $first: "$dept.name" },
          code: { $first: "$dept.code" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $project: {
          _id: 0,
          department: {
            id: "$_id",
            name: 1,
            code: 1
          },
          employeeCount: "$count"
        }
      }
    ]);
    
    const totalEmployees = result.reduce((sum, dept) => sum + dept.employeeCount, 0);
    
    const departmentsWithPercentage = result.map(dept => ({
      ...dept,
      percentage: totalEmployees > 0 ? ((dept.employeeCount / totalEmployees) * 100).toFixed(2) : 0
    }));
    
    res.status(200).json({
      success: true,
      totalEmployees,
      departments: departmentsWithPercentage
    });
  } catch (error) {
    console.error("Department distribution error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch department distribution", 
      error: (error as Error).message 
    });
  }
};

