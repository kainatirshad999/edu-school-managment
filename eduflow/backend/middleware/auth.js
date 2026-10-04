const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const School = require("../models/School");
const User = require("../models/User");

// Verifies JWT and attaches req.user = { id, role, school } plus a full profile doc
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin") {
      const school = await School.findById(decoded.id).select("-password");
      if (!school) {
        res.status(401);
        throw new Error("Not authorized, school not found");
      }
      req.user = { id: school._id, role: "admin", school: school._id, doc: school };
    } else {
      const user = await User.findById(decoded.id).select("-password");
      if (!user || !user.isActive) {
        res.status(401);
        throw new Error("Not authorized, user not found or inactive");
      }
      req.user = { id: user._id, role: user.role, school: user.school, doc: user };
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// Restrict route to specific roles: authorize('admin'), authorize('admin','teacher')
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user.role}' is not allowed to access this resource`);
  }
  next();
};

// Permissions that Student/Parent are always allowed to call, because they
// only ever let a student/parent view data scoped to their own account
// (each controller independently verifies the record belongs to them).
// Action permissions (collect_fees, mark_attendance, create_*, edit_*,
// delete_*, assign_homework, etc.) are NOT in this list, so Student/Parent
// remain blocked from them even though the check below would otherwise
// short-circuit for their role.
const SELF_VIEW_PERMISSIONS = [
  "view_attendance", "view_homework", "view_test", "view_exam", "view_result",
  "view_timetable", "view_notice", "use_communication", "view_study_material",
  "use_ai_assistant", "view_fees", "view_assignment",
];

// Fine-grained permission check - the toggleable list (Roles & Permissions
// module) is designed around the Teacher role. Admin always has full access.
// Student/Parent pass only for the self-view permissions above; anything else
// (actions that modify data) is denied for them regardless of this list.
const hasPermission = (permission) => (req, res, next) => {
  if (req.user.role === "admin") return next();
  if (["student", "parent"].includes(req.user.role)) {
    if (SELF_VIEW_PERMISSIONS.includes(permission)) return next();
    res.status(403);
    throw new Error(`Role '${req.user.role}' is not allowed to perform this action`);
  }
  const perms = req.user.doc?.permissions || [];
  if (!perms.includes(permission)) {
    res.status(403);
    throw new Error(`Missing permission: ${permission}`);
  }
  next();
};

module.exports = { protect, authorize, hasPermission };
