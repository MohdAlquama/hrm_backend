import express from "express";
import db from "../config/dbControl.js";

const leaveRouter = express.Router();

// Get all leave requests

leaveRouter.get("/totalLeave/:emp_id", function (req, res) {
  const empId = req.params.emp_id; // Extracting the employee ID from the route parameter
  const query = `SELECT * FROM leave_policy WHERE emp_id = ?;`;

  db.query(query, [empId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    // If the result is empty, return a meaningful response
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: `No leave data found for employee ID: ${empId}` });
    }

    // Extract and return only the total_leave value
    const totalLeave = result[0].total_leave;
    const earned_leave	= result[0].earned_leave;
    const casual_leave	= result[0].casual_leave;
    const sick_leave	= result[0].sick_leave;
    return res.json({ total_leave: totalLeave
    ,earned_leave: earned_leave
    ,casual_leave: casual_leave
    ,sick_leave: sick_leave
     });
  });
});
leaveRouter.post("/request", function (req, res) {
  console.log(req.body); // Log the request body

  const { emp_id, leave_type, start_date, end_date, days_requested, reason } = req.body;
  const status = "Pending";
  const date = new Date();
  const mysqlFormattedDate = date.toISOString().slice(0, 19).replace("T", " ");
  console.log(mysqlFormattedDate);

  const insertLeave = 
    "INSERT INTO leave_application (leave_type, leave_start_date, leave_end_date, leave_days, status, applied_date, reason, emp_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    insertLeave,
    [leave_type, start_date, end_date, days_requested, status, mysqlFormattedDate, reason, emp_id],
    function (err, result) {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      return res.json({ message: "Leave request submitted successfully!" });
    }
  );
});
leaveRouter.get("/leaveRequests/:emp_id", function (req, res) {
    const empId = req.params.emp_id; // Get emp_id from the request parameters
    const query = "SELECT * FROM leave_application WHERE emp_id = ?"; // Use parameterized query

    db.query(query, [empId], (err, result) => { // Pass empId as an array to prevent SQL injection
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.json(result); // Send the query result as a response
    });
});
;

export default leaveRouter;
