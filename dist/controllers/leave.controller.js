import { LeaveRequest } from "../models/LeaveRequest";
const calculateDays = (startDate, endDate, isHalfDay) => {
    if (isHalfDay)
        return 0.5;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
export const getAllLeaveRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, leaveType, employeeId } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (leaveType)
            filter.leaveType = leaveType;
        if (employeeId)
            filter.employee = employeeId;
        if (req.user?.role === "Employee") {
            filter.employee = req.user.id;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [leaves, total] = await Promise.all([
            LeaveRequest.find(filter)
                .populate("employee", "firstName lastName email employeeId")
                .populate("approvedBy", "firstName lastName email")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            LeaveRequest.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            data: leaves,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch leave requests", error: error.message });
    }
};
export const getLeaveRequestById = async (req, res) => {
    try {
        const leave = await LeaveRequest.findById(req.params.id)
            .populate("employee", "firstName lastName email employeeId")
            .populate("approvedBy", "firstName lastName email");
        if (!leave) {
            res.status(404).json({ success: false, message: "Leave request not found" });
            return;
        }
        if (req.user?.role === "Employee" && leave.employee._id.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        res.status(200).json({ success: true, data: leave });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch leave request", error: error.message });
    }
};
export const createLeaveRequest = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason, isHalfDay } = req.body;
        const numberOfDays = calculateDays(new Date(startDate), new Date(endDate), isHalfDay || false);
        const leaveData = {
            employee: req.user?.id,
            leaveType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            numberOfDays,
            reason,
            isHalfDay: isHalfDay || false,
            status: "Pending",
            appliedAt: new Date()
        };
        const leave = await LeaveRequest.create(leaveData);
        res.status(201).json({ success: true, data: leave, message: "Leave request submitted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to create leave request", error: error.message });
    }
};
export const updateLeaveRequest = async (req, res) => {
    try {
        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) {
            res.status(404).json({ success: false, message: "Leave request not found" });
            return;
        }
        if (leave.status !== "Pending") {
            res.status(400).json({ success: false, message: "Only pending leave requests can be updated" });
            return;
        }
        if (leave.employee.toString() !== req.user?.id && req.user?.role === "Employee") {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        if (req.body.startDate || req.body.endDate || req.body.isHalfDay !== undefined) {
            const startDate = req.body.startDate || leave.startDate;
            const endDate = req.body.endDate || leave.endDate;
            const isHalfDay = req.body.isHalfDay !== undefined ? req.body.isHalfDay : leave.isHalfDay;
            req.body.numberOfDays = calculateDays(new Date(startDate), new Date(endDate), isHalfDay);
        }
        const updatedLeave = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedLeave, message: "Leave request updated successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to update leave request", error: error.message });
    }
};
export const processLeaveRequest = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const { id } = req.params;
        if (!["Approved", "Rejected"].includes(status)) {
            res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
            return;
        }
        const leave = await LeaveRequest.findById(id);
        if (!leave) {
            res.status(404).json({ success: false, message: "Leave request not found" });
            return;
        }
        if (leave.status !== "Pending") {
            res.status(400).json({ success: false, message: "Leave request already processed" });
            return;
        }
        const updateData = { status, approvedBy: req.user?.id, approvedAt: new Date() };
        if (status === "Rejected" && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        const updatedLeave = await LeaveRequest.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, data: updatedLeave, message: `Leave request ${status.toLowerCase()} successfully` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to process leave request", error: error.message });
    }
};
export const cancelLeaveRequest = async (req, res) => {
    try {
        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) {
            res.status(404).json({ success: false, message: "Leave request not found" });
            return;
        }
        if (leave.status !== "Pending") {
            res.status(400).json({ success: false, message: "Only pending leave requests can be cancelled" });
            return;
        }
        if (leave.employee.toString() !== req.user?.id && req.user?.role === "Employee") {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        leave.status = "Cancelled";
        await leave.save();
        res.status(200).json({ success: true, message: "Leave request cancelled successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to cancel leave request", error: error.message });
    }
};
export const getLeaveBalance = async (req, res) => {
    try {
        const employeeId = req.params.employeeId || req.user?.id;
        const currentYear = new Date().getFullYear();
        const leaves = await LeaveRequest.find({
            employee: employeeId,
            status: "Approved",
            startDate: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
        });
        const leaveBalances = {
            Annual: { total: 12, used: 0, remaining: 12 },
            Sick: { total: 10, used: 0, remaining: 10 },
            Casual: { total: 8, used: 0, remaining: 8 },
            Maternity: { total: 84, used: 0, remaining: 84 },
            Paternity: { total: 15, used: 0, remaining: 15 },
            Unpaid: { total: 0, used: 0, remaining: 0 },
            Bereavement: { total: 5, used: 0, remaining: 5 },
            Study: { total: 12, used: 0, remaining: 12 }
        };
        for (const leave of leaves) {
            const type = leave.leaveType;
            if (leaveBalances[type]) {
                leaveBalances[type].used += leave.numberOfDays || 1;
                leaveBalances[type].remaining = leaveBalances[type].total - leaveBalances[type].used;
                if (leaveBalances[type].remaining < 0)
                    leaveBalances[type].remaining = 0;
            }
        }
        res.status(200).json({ success: true, data: leaveBalances });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch leave balance", error: error.message });
    }
};
