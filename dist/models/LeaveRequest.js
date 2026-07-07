import { Schema, model } from "mongoose";
const LeaveRequestSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        required: [true, "Employee is required"],
        index: true,
    },
    leaveType: {
        type: String,
        enum: {
            values: ["Sick", "Casual", "Annual", "Maternity", "Paternity", "Unpaid", "Bereavement", "Study"],
            message: "{VALUE} is not a valid leave type",
        },
        required: [true, "Leave type is required"],
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
        validate: {
            validator: function (value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            },
            message: "Start date cannot be in the past",
        },
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"],
        validate: {
            validator: function (value) {
                return value >= this.startDate;
            },
            message: "End date must be after or equal to start date",
        },
    },
    isHalfDay: {
        type: Boolean,
        default: false,
    },
    halfDayType: {
        type: String,
        enum: {
            values: ["First Half", "Second Half"],
            message: "{VALUE} is not a valid half day type",
        },
        required: function () {
            return this.isHalfDay === true;
        },
    },
    numberOfDays: {
        type: Number,
        default: 0,
        min: 0.5,
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        trim: true,
        minlength: [5, "Reason must be at least 5 characters"],
        maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    status: {
        type: String,
        enum: {
            values: ["Pending", "Approved", "Rejected", "Cancelled"],
            message: "{VALUE} is not a valid status",
        },
        default: "Pending",
        required: true,
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        required: false,
    },
    approvedAt: {
        type: Date,
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [200, "Rejection reason cannot exceed 200 characters"],
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    attachment: {
        type: String,
        trim: true,
    },
    notifiedTo: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
LeaveRequestSchema.index({ employee: 1, status: 1 });
LeaveRequestSchema.index({ employee: 1, startDate: -1, endDate: -1 });
LeaveRequestSchema.index({ startDate: -1, endDate: -1 });
LeaveRequestSchema.index({ status: 1, appliedAt: -1 });
LeaveRequestSchema.index({ approvedBy: 1, status: 1 });
LeaveRequestSchema.pre("save", function (next) {
    const doc = this;
    if (doc.isHalfDay) {
        doc.numberOfDays = 0.5;
    }
    else {
        const start = new Date(doc.startDate);
        const end = new Date(doc.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        doc.numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    next();
});
LeaveRequestSchema.pre("save", function (next) {
    const doc = this;
    if (doc.status === "Approved" && !doc.approvedAt) {
        doc.approvedAt = new Date();
    }
    if (doc.status === "Rejected" && doc.rejectionReason && !doc.approvedAt) {
        doc.approvedAt = new Date();
    }
    next();
});
LeaveRequestSchema.methods.calculateDays = function () {
    const doc = this;
    if (doc.isHalfDay)
        return 0.5;
    const start = new Date(doc.startDate);
    const end = new Date(doc.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
export const LeaveRequest = model("LeaveRequest", LeaveRequestSchema);
