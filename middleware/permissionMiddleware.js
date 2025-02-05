import db from "../config/dbControl";
// Middleware to check user role and permissions from the database
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const permission = req.headers.permission;
    console.log(permission);
    
  };
};

export default { checkPermission };