export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login.'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. ${req.user.role} role not authorized. Required: ${roles.join(', ')}`
            });
            return;
        }
        next();
    };
};
export const requireAdmin = requireRole('Admin');
export const requireHR = requireRole('Admin', 'HR');
export const requireManager = requireRole('Admin', 'HR', 'Manager');
