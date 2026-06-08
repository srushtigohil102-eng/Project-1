import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { randomNumber, randomItem } from "../utils/helpers";
import { faker } from '@faker-js/faker';

// Import models directly from their files
import { Department } from "../models/Department";
import { Employee } from "../models/Employee";
import { LeaveRequest } from "../models/LeaveRequest";
import { Payroll } from "../models/Payroll";

// Configure faker
faker.seed(123);

// Department Data
const DEPARTMENTS = [
  { name: "ENGINEERING", code: "ENG", description: "Software development", budget: 5000000, location: "Floor 3, Tower A", phoneNumber: "080-1234001", email: "engineering@hrms.com" },
  { name: "HUMAN RESOURCES", code: "HR", description: "Human Resources", budget: 1500000, location: "Floor 2, Tower B", phoneNumber: "080-1234002", email: "hr@hrms.com" },
  { name: "SALES", code: "SALES", description: "Sales Department", budget: 3000000, location: "Floor 1, Tower A", phoneNumber: "080-1234003", email: "sales@hrms.com" },
  { name: "MARKETING", code: "MKT", description: "Marketing Department", budget: 2000000, location: "Floor 1, Tower B", phoneNumber: "080-1234004", email: "marketing@hrms.com" },
  { name: "FINANCE", code: "FIN", description: "Finance Department", budget: 2500000, location: "Floor 2, Tower A", phoneNumber: "080-1234005", email: "finance@hrms.com" },
  { name: "OPERATIONS", code: "OPS", description: "Operations", budget: 2200000, location: "Floor 3, Tower B", phoneNumber: "080-1234006", email: "operations@hrms.com" },
  { name: "PRODUCT", code: "PROD", description: "Product Management", budget: 2800000, location: "Floor 4, Tower A", phoneNumber: "080-1234007", email: "product@hrms.com" },
  { name: "CUSTOMER SUPPORT", code: "CS", description: "Customer Support", budget: 1800000, location: "Floor 4, Tower B", phoneNumber: "080-1234008", email: "support@hrms.com" },
];

// Designations by Department
const DESIGNATIONS: Record<string, string[]> = {
  "ENGINEERING": ["Software Engineer", "Senior Software Engineer", "Tech Lead", "Engineering Manager", "Principal Engineer", "DevOps Engineer", "QA Engineer", "System Architect"],
  "HUMAN RESOURCES": ["HR Associate", "HR Generalist", "HR Manager", "Recruitment Specialist", "Training Coordinator", "Payroll Specialist", "Talent Acquisition Lead"],
  "SALES": ["Sales Associate", "Account Executive", "Sales Manager", "Regional Manager", "Business Development Lead", "Inside Sales Rep", "Sales Director"],
  "MARKETING": ["Marketing Coordinator", "Digital Marketing Specialist", "Marketing Manager", "Brand Manager", "Content Strategist", "SEO Specialist", "Social Media Manager"],
  "FINANCE": ["Financial Analyst", "Accountant", "Finance Manager", "Controller", "Tax Specialist", "Accounts Payable", "Audit Associate"],
  "OPERATIONS": ["Operations Associate", "Operations Manager", "Process Analyst", "Logistics Coordinator", "Vendor Manager", "Supply Chain Specialist"],
  "PRODUCT": ["Product Analyst", "Product Manager", "Senior Product Manager", "Product Owner", "Product Designer", "Technical Product Manager"],
  "CUSTOMER SUPPORT": ["Support Associate", "Senior Support Associate", "Team Lead Support", "Customer Success Manager", "Technical Support Engineer", "Support Manager"],
};

// Leave Types and Statuses
const LEAVE_TYPES = ["Sick", "Casual", "Annual", "Maternity", "Paternity", "Unpaid", "Bereavement", "Study"];
const LEAVE_STATUS = ["Pending", "Approved", "Approved", "Rejected", "Approved"];
const EMPLOYEE_STATUS = ["Active", "Active", "Active", "Active", "On Leave", "Inactive"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
const STATES = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal", "Gujarat"];

// Helper function to generate salary based on role and designation
const generateSalary = (role: string, designation: string): number => {
  if (role === "Admin") return 250000;
  if (role === "HR") return 80000;
  if (designation.includes("Director") || designation.includes("Principal")) return 220000;
  if (designation.includes("Manager") || designation.includes("Lead")) return 150000;
  if (designation.includes("Senior")) return 100000;
  if (designation.includes("Specialist") || designation.includes("Analyst")) return 70000;
  if (role === "Manager") return 120000;
  return 50000;
};

// Generate random date within range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate joining date (between 2020 and 2024)
const generateJoiningDate = (): Date => {
  const start = new Date(2020, 0, 1);
  const end = new Date(2024, 11, 31);
  return randomDate(start, end);
};

// Generate date of birth
const generateDOB = (): Date => {
  const age = randomNumber(22, 60);
  const year = new Date().getFullYear() - age;
  return new Date(year, randomNumber(0, 11), randomNumber(1, 28));
};

// Generate bank details
const generateBankDetails = () => ({
  accountNumber: faker.finance.accountNumber(12),
  ifscCode: faker.finance.iban().substring(0, 11).toUpperCase(),
  bankName: faker.company.name() + " Bank",
  accountHolderName: "",
});

// Generate address
const generateAddress = () => ({
  street: faker.location.streetAddress(),
  city: randomItem(CITIES),
  state: randomItem(STATES),
  country: "India",
  zipCode: faker.location.zipCode("######"),
});

// Main seed function
async function seedDatabase() {
  console.log("\n🚀 Starting Enterprise HRMS Database Seeding...\n");
  console.log("=".repeat(60));
  
  try {
    await connectDB();
    
    // Clear existing data
    console.log("\n🗑️  Clearing existing data...");
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Payroll.deleteMany({});
    console.log("✅ All existing data cleared");
    
    // ==================== STEP 1: Create Departments ====================
    console.log("\n📁 Creating departments...");
    const departmentDocs = [];
    for (const dept of DEPARTMENTS) {
      const department = await Department.create(dept);
      departmentDocs.push(department);
      console.log(`  ✅ ${dept.code} - ${dept.name}`);
    }
    console.log(`  Total: ${departmentDocs.length} departments created`);
    
    // ==================== STEP 2: Create Employees ====================
    console.log("\n👥 Creating employees...");
    const employees: any[] = [];
    const defaultPassword = "Admin@123456";
    
    // Create 1 System Admin
    const adminDept = departmentDocs.find(d => d.code === "ENG")!;
    const admin = await Employee.create({
      employeeId: `ADMIN${new Date().getFullYear()}001`,
      firstName: "System",
      lastName: "Administrator",
      email: "admin@hrms.com",
      phoneNumber: "9876543210",
      password: defaultPassword,
      role: "Admin",
      department: adminDept._id,
      designation: "System Administrator",
      salary: 250000,
      dateOfBirth: new Date(1985, 5, 15),
      gender: "Male",
      maritalStatus: "Married",
      joiningDate: new Date(2020, 0, 1),
      status: "Active",
      isActive: true,
    });
    employees.push(admin);
    console.log(`  ✅ ADMIN: ${admin.firstName} ${admin.lastName} (${admin.email})`);
    
    // Create 2 HR Users
    const hrDept = departmentDocs.find(d => d.code === "HR")!;
    for (let i = 0; i < 2; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const hr = await Employee.create({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hrms.com`,
        phoneNumber: faker.phone.number("98#######0"),
        password: defaultPassword,
        role: "HR",
        department: hrDept._id,
        designation: randomItem(DESIGNATIONS["HUMAN RESOURCES"]),
        salary: generateSalary("HR", ""),
        dateOfBirth: generateDOB(),
        gender: randomItem(GENDERS),
        maritalStatus: randomItem(MARITAL_STATUS),
        address: generateAddress(),
        bankDetails: generateBankDetails(),
        joiningDate: generateJoiningDate(),
        status: "Active",
        isActive: true,
      });
      employees.push(hr);
      console.log(`  ✅ HR: ${hr.firstName} ${hr.lastName} (${hr.email})`);
    }
    
    // Create 1 Manager per department
    for (const dept of departmentDocs) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const designation = `${dept.name} Manager`;
      const manager = await Employee.create({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${dept.code.toLowerCase()}.com`,
        phoneNumber: faker.phone.number("98#######0"),
        password: defaultPassword,
        role: "Manager",
        department: dept._id,
        designation: designation,
        salary: generateSalary("Manager", designation),
        dateOfBirth: generateDOB(),
        gender: randomItem(GENDERS),
        maritalStatus: randomItem(MARITAL_STATUS),
        address: generateAddress(),
        bankDetails: generateBankDetails(),
        joiningDate: generateJoiningDate(),
        status: "Active",
        isActive: true,
      });
      employees.push(manager);
      console.log(`  ✅ MANAGER (${dept.code}): ${manager.firstName} ${manager.lastName}`);
    }
    
    // Create regular employees (target total 50+ employees)
    const targetTotal = 55;
    const remainingNeeded = targetTotal - employees.length;
    
    for (let i = 0; i < remainingNeeded; i++) {
      const department = randomItem(departmentDocs);
      const deptName = department.name as keyof typeof DESIGNATIONS;
      const designation = randomItem(DESIGNATIONS[deptName] || DESIGNATIONS["ENGINEERING"]);
      const role = "Employee";
      
      const deptManager = employees.find(
        (emp: any) => emp.department?.toString() === department._id.toString() && emp.role === "Manager"
      );
      
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const joiningDate = generateJoiningDate();
      
      const employee = await Employee.create({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${department.code.toLowerCase()}.com`,
        phoneNumber: faker.phone.number("98#######0"),
        password: defaultPassword,
        role: role,
        department: department._id,
        manager: deptManager?._id,
        designation: designation,
        salary: generateSalary(role, designation),
        dateOfBirth: generateDOB(),
        gender: randomItem(GENDERS),
        maritalStatus: randomItem(MARITAL_STATUS),
        address: generateAddress(),
        bankDetails: generateBankDetails(),
        joiningDate: joiningDate,
        status: randomItem(EMPLOYEE_STATUS),
        isActive: true,
      });
      employees.push(employee);
      
      if ((i + 1) % 10 === 0) {
        console.log(`  ✅ Created ${i + 1}/${remainingNeeded} regular employees...`);
      }
    }
    
    console.log(`\n  📊 Total employees created: ${employees.length}`);
    console.log(`     - Admin: ${employees.filter((e: any) => e.role === "Admin").length}`);
    console.log(`     - HR: ${employees.filter((e: any) => e.role === "HR").length}`);
    console.log(`     - Managers: ${employees.filter((e: any) => e.role === "Manager").length}`);
    console.log(`     - Employees: ${employees.filter((e: any) => e.role === "Employee").length}`);
    
    // ==================== STEP 3: Update Department Heads ====================
    console.log("\n👔 Assigning department heads...");
    for (const dept of departmentDocs) {
      const deptHead = employees.find(
        (emp: any) => emp.department?.toString() === dept._id.toString() && 
        (emp.role === "Manager" || emp.role === "Admin")
      );
      if (deptHead) {
        dept.departmentHead = deptHead._id;
        await dept.save();
        console.log(`  ✅ ${dept.code} department head: ${deptHead.firstName} ${deptHead.lastName}`);
      }
    }
    
    // ==================== STEP 4: Create Leave Requests ====================
console.log("\n📅 Creating leave requests...");
let leaveCount = 0;

// Helper function to calculate days between dates
const calculateDays = (startDate: Date, endDate: Date, isHalfDay: boolean): number => {
  if (isHalfDay) return 0.5;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

for (const employee of employees) {
  const numLeaves = randomNumber(1, 3);
  
  for (let i = 0; i < numLeaves; i++) {
    // Generate future dates only (not in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start date between today and 60 days in future
    const startDaysFromNow = randomNumber(1, 60);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + startDaysFromNow);
    
    // End date between 1 and 7 days after start
    const duration = randomNumber(1, 5);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);
    
    const status = randomItem(LEAVE_STATUS);
    const isHalfDay = Math.random() > 0.9;
    
    // For half-day leaves, make start and end date same day
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    let finalIsHalfDay = isHalfDay;
    let numberOfDays = 1;
    
    if (isHalfDay) {
      finalEndDate = startDate;
      numberOfDays = 0.5;
    } else {
      numberOfDays = calculateDays(startDate, endDate, false);
    }
    
    const approver = status !== "Pending" 
      ? employees.find((emp: any) => (emp.role === "Manager" || emp.role === "HR") && 
          emp.department?.toString() === employee.department?.toString())
      : undefined;
    
    try {
      await LeaveRequest.create({
        employee: employee._id,
        leaveType: randomItem(LEAVE_TYPES),
        startDate: finalStartDate,
        endDate: finalEndDate,
        isHalfDay: finalIsHalfDay,
        numberOfDays: numberOfDays,
        reason: faker.lorem.sentence({ min: 5, max: 15 }),
        status: status,
        approvedBy: approver?._id,
        approvedAt: status !== "Pending" ? new Date() : undefined,
        rejectionReason: status === "Rejected" ? faker.lorem.sentence() : undefined,
        appliedAt: new Date(),
      });
      leaveCount++;
    } catch (err) {
      // Skip invalid leave requests
      console.log(`  ⚠️ Skipped invalid leave request for ${employee.firstName} ${employee.lastName}`);
    }
  }
}
console.log(`  ✅ Total leave requests created: ${leaveCount}`);
    
    // ==================== STEP 5: Create Payroll Records ====================
    console.log("\n💰 Creating payroll records...");
    let payrollCount = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    for (const employee of employees) {
      for (let i = 0; i < 6; i++) {
        let month = currentMonth - i;
        let year = currentYear;
        
        if (month < 1) {
          month += 12;
          year -= 1;
        }
        
        const basicSalary = employee.salary;
        const hra = basicSalary * 0.4;
        const da = basicSalary * 0.1;
        const ta = basicSalary * 0.08;
        const medicalAllowance = 1250;
        const specialAllowance = basicSalary * 0.15;
        
        const pf = basicSalary * 0.12;
        const professionalTax = basicSalary > 30000 ? 200 : 0;
        const tax = basicSalary > 100000 ? basicSalary * 0.05 : 0;
        
        const isPaid = (year < currentYear) || (year === currentYear && month < currentMonth);
        
        await Payroll.create({
          employee: employee._id,
          month: month,
          year: year,
          salaryBreakdown: {
            basic: basicSalary,
            hra: hra,
            da: da,
            ta: ta,
            medicalAllowance: medicalAllowance,
            specialAllowance: specialAllowance,
            bonus: Math.random() > 0.7 ? basicSalary * 0.1 : 0,
          },
          deductionBreakdown: {
            tax: tax,
            providentFund: pf,
            professionalTax: professionalTax,
            insurance: 500,
          },
          totalWorkingDays: 30,
          presentDays: randomNumber(20, 30),
          absentDays: randomNumber(0, 3),
          leaveDays: randomNumber(0, 3),
          holidayDays: randomNumber(2, 5),
          paymentDate: isPaid ? new Date(year, month, 28) : undefined,
          status: isPaid ? "Paid" : "Processed",
          generatedBy: employees.find((e: any) => e.role === "HR")?._id || employees[0]._id,
          isActive: true,
        });
        payrollCount++;
      }
    }
    console.log(`  ✅ Total payroll records created: ${payrollCount}`);
    
    // Final Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 ENTERPRISE HRMS DATABASE SEEDING COMPLETED!");
    console.log("=".repeat(60));
    console.log("\n📊 FINAL SUMMARY:");
    console.log(`  🏢 Departments: ${departmentDocs.length}`);
    console.log(`  👥 Employees: ${employees.length}`);
    console.log(`  📅 Leave Requests: ${leaveCount}`);
    console.log(`  💰 Payroll Records: ${payrollCount}`);
    
    console.log("\n🔑 DEFAULT LOGIN CREDENTIALS:");
    console.log("  Email: admin@hrms.com");
    console.log("  Password: Admin@123456\n");
    
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB\n");
  }
}

seedDatabase();