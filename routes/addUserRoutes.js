import express from 'express';
import db from '../config/dbControl.js';

const addUserRoutes = express.Router();

// Fetch all roles
addUserRoutes.get('/fetchRole', (req, res) => {
  const query = "SELECT * FROM role_and_permission";
  
  db.query(query, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch role",
        details: err
      });
    }
    return res.json({
      success: true,
      message: "Role fetched successfully",
      data: result,
    });
  });
});

// Get role permissions for a specific role
addUserRoutes.get('/getRolePermissions', (req, res) => {
  const { role_id } = req.query;
  console.log("Role ID received:", role_id);

  const query = "SELECT permission FROM role_and_permission WHERE role_id = ?";
  
  db.query(query, [role_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch permissions",
        details: err
      });
    }

    if (result.length > 0) {
      return res.json({
        success: true,
        permissions: result[0].permission
      });
    } else {
      return res.status(404).json({
        success: false,
        error: "Role not found"
      });
    }
  });
});

// Fetch all departments
addUserRoutes.get('/fetchDepartment', (req, res) => {
  const query = "SELECT * FROM department";
  
  db.query(query, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch departments",
        details: err
      });
    }
    return res.json({
      success: true,
      message: "Departments fetched successfully",
      data: result,
    });
  });
});


// Fetch designations for a specific department
addUserRoutes.get('/fetchDesignation', (req, res) => {
  const { dept_id } = req.query;
  
  if (!dept_id) {
    return res.status(400).json({
      success: false,
      error: "Department ID is required"
    });
  }

  const query = "SELECT * FROM designation WHERE dept_id = ?";
  
  db.query(query, [dept_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch designations",
        details: err
      });
    }
    return res.json({
      success: true,
      message: "Designations fetched successfully",
      data: result,
    });
  });
});

// Submit new user data
addUserRoutes.post('/submitUser', (req, res) => {
  console.log("Received user data:", req.body);
  const {
    role,
    rolePermission,
    empFullName,
    empPersonalEmail,
    empConfirmationdate,
    empofferedCTC,
    empPhoneNo,
    empAadhaarNo,
    empPanCardNo,
    empDepartment,
    empDesignation,
    empJoinDate,
    empStatus,
    empGender,
    empDob,
  } = req.body;

  const employmentstatus= "Probation";
  const last_updated= 'New';
  const last_updated_time= new Date();

  // Validate required fields
  if (!empFullName || !empPersonalEmail  || !role) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  const query = `
    INSERT INTO master (
      emp_full_name,
      emp_personal_email,
      emp_confirmation_date,
      emp_offered_ctc,
      emp_phone_no,
      emp_addhar_no,
      emp_pan_card_no,
      emp_department,
      emp_designation,
      emp_join_date,
      emp_status,
      emp_gender,
      emp_dob,
      role_id,
      role_permission,
      emp_empstatus,
      last_updated_status,
      last_updated_time
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?)
  `;

  const values = [
    empFullName,
    empPersonalEmail,
    empConfirmationdate,
    empofferedCTC,
    empPhoneNo || null,
    empAadhaarNo || null,
    empPanCardNo || null,
    empDepartment,
    empDesignation,
    empJoinDate,
    empStatus,
    empGender,
    empDob,
    role,
    rolePermission,
    employmentstatus,
    last_updated,
    last_updated_time

  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to submit user data",
        details: err
      });
    }

    return res.json({
      success: true,
      message: "User data submitted successfully",
      data: {
        id: result.insertId,
     
      }
    });
  });
});

//submit personal information
addUserRoutes.post('/submitPersonalInformation', async(req, res) => {
  const { 
    emp_id,
    permanent_address,
    permanent_city,
    permanent_state,
    permanent_zip_code,
    current_address,
    current_city,
    current_state,
    current_zip_code,
    alternate_mob_no,
    emergency_person_name,
    emergency_relationship,
    emergency_mob_no,
    emergency_address,
    marital_status,
    blood_group,
    account_holder_name,
    bank_name,
    branch_name,
    account_no,
    IFSC_code,
    education
  } = req.body;
  const last_updated_status= 'updated';
  const last_updated_time= new Date();
      const last_updated_querry = "UPDATE master SET last_updated_time = ? , last_updated_status = ?  where emp_id = ? ; ";  


  // ✅ Insert into `bank_details`
  const bankQuery = `INSERT INTO bank_details (account_holder_name, bank_name, branch_name, account_no, IFSC_code, emp_id) VALUES (?, ?, ?,?, ?, ?)`;
  db.query(bankQuery, [account_holder_name, bank_name, branch_name, account_no, IFSC_code, emp_id], (bankError, bankResults) => {
    if (bankError) {
      console.error("Error inserting into bank_details:", bankError);
      return res.status(500).json({
        success: false,
        error: "Database operation failed for bank details",
        details: bankError.message
      });
    }

    // ✅ Insert into `personal_information`
    const personalQuery = `INSERT INTO personal_information (permanent_address, permanent_city, permanent_state, permanent_zip_code, current_address, current_city, current_state,
        current_zip_code, alternate_mob_no, emergency_person_name, emergency_relationship, emergency_mob_no, emergency_address, marital_status,blood_group, emp_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    db.query(personalQuery, [
      permanent_address, permanent_city, permanent_state, permanent_zip_code,
      current_address, current_city, current_state, current_zip_code,
      alternate_mob_no, emergency_person_name, emergency_relationship,
      emergency_mob_no, emergency_address, marital_status,blood_group, emp_id
    ], (personalError, personalResults) => {
      if (personalError) {
        console.error("Error inserting into personal_information:", personalError);
        return res.status(500).json({
          success: false,
          error: "Database operation failed for personal information",
          details: personalError.message
        });
      }

      // ✅ Insert into `educational_background`
      if (education && Array.isArray(education)) {
        let completed = 0;
        let failed = false;

        education.forEach((edu, index) => {
          const educationQuery = `INSERT INTO educational_background (degree, institution, year_of_passing, emp_id) VALUES (?, ?, ?, ?)`;
          db.query(educationQuery, [edu.degree, edu.institution, edu.year_of_passing, emp_id], (eduError, eduResults) => {
            if (eduError) {
              console.error("Error inserting into educational_background:", eduError);
              failed = true;
            } else {
              completed++;
            }

            // If all education records are processed, check if there was any failure
            if (index === education.length - 1) {
              if (failed) {
                return res.status(500).json({
                  success: false,
                  error: "Database operation failed for education records",
                });
              }

              // ✅ Final Response after all operations are done
              return res.json({
                success: true,
                message: "Personal Information and Education details submitted successfully"
              });
            }
          });
        });
      } else {
        // If education data is empty or not provided
        return res.json({
          success: true,
          message: "Personal Information submitted successfully (no education data)"
        });
      }
    });

    db.query (last_updated_querry , [last_updated_time , last_updated_status , emp_id], function (result , error ){
      console.error("Error inserting into bank_details:", error);
      return res.status(500).json({
        success: false,
        error: "master error occurred ",
        details: error.message
      });
    })




  });






});

//fetch employee
addUserRoutes.get('/getAllEmployees', (req, res) => {
  const query = `
SELECT 
    e.id,
    e.emp_id,
    e.emp_full_name,
    e.emp_department AS emp_departmentid,
    e.emp_designation AS emp_designationid,
    e.emp_confirmation_date,
    e.emp_empstatus,
    e.last_updated_time,
    e.last_updated_status,
    e.emp_offered_ctc,
    e.emp_personal_email,
    e.emp_phone_no,
    e.emp_addhar_no,
    e.emp_pan_card_no,
    d.dep_name AS emp_department,
    des.designation_name AS emp_designation,
    e.emp_join_date,
    e.emp_status,
    r.role AS role_name,
    e.emp_email,
    e.emp_password,
    r.permission,
    tl.emp_full_name AS team_leader_name,  -- Fetch Team Leader Name
    m.emp_full_name AS manager_name        -- Fetch Manager Name
FROM 
    master e
LEFT JOIN 
    department d ON e.emp_department = d.dep_id
LEFT JOIN 
    designation des ON e.emp_designation = des.designation_id
LEFT JOIN 
    role_and_permission r ON e.role_id = r.role_id
LEFT JOIN 
    master tl ON e.team_leader_id = tl.id  -- Joining master table for Team Leader
LEFT JOIN 
    master m ON e.manager_id = m.id;       -- Joining master table for Manager


  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch employees",
        details: err,
      });
    }
    console.log("Employees fetched:", result); // Log the result here
    return res.status(200).json({
      success: true,
      message: "Successfully fetched employees",
      data: result,
    });
  });
  
});

addUserRoutes.get('/getSingleEmployeeeducation/:emp_id', (req, res) => {
  const { emp_id } = req.params;

  db.query(
    `SELECT * FROM educational_background WHERE emp_id = ?`, 
    [emp_id], 
    (err, rows) => { 
      if (err) {
        res.status(500).json({ success: false, error: err.message });
      } else {
        res.json({ success: true, data: rows });
      }
    }
  );
  
});

addUserRoutes.get('/getSingleEmployee/:emp_id', (req, res) => {
  const { emp_id } = req.params;
  
   const query = `
  SELECT 
    e.id,
    e.emp_id,
    e.emp_full_name,
    e.emp_department AS emp_departmentid,
    e.emp_designation AS emp_designationid,
    e.emp_confirmation_date,
    e.emp_empstatus,
    e.emp_offered_ctc,
    e.emp_personal_email,
    e.emp_phone_no,
    e.emp_addhar_no,
    e.emp_pan_card_no,
   
    d.dep_name AS emp_department,
    des.designation_name AS emp_designation,
    e.emp_gender,
    e.emp_dob,
    e.emp_join_date,
    e.emp_status,
    r.role AS role_name,
    e.emp_email,
    e.emp_password,
    r.permission,
    tl.emp_full_name AS team_leader_name,
    m.emp_full_name AS manager_name,

    -- Bank Details
    bd.account_holder_name,
    bd.bank_name,
    bd.branch_name,
    bd.account_no,
    bd.IFSC_code,

    -- Address and Emergency Details
    ed.permanent_address,
    ed.permanent_city,
    ed.permanent_state,
    ed.permanent_zip_code,
    ed.current_address,
    ed.current_city,
    ed.current_state,
    ed.current_zip_code,
    ed.alternate_mob_no,
    ed.emergency_person_name,
    ed.emergency_relationship,
    ed.emergency_mob_no,
    ed.emergency_address,
    ed.marital_status,
    ed.blood_group,

    -- Educational Background
    eb.degree,
    eb.institution,
    eb.year_of_passing
  FROM 
    master e
  LEFT JOIN 
    department d ON e.emp_department = d.dep_id
  LEFT JOIN 
    designation des ON e.emp_designation = des.designation_id
  LEFT JOIN 
    role_and_permission r ON e.role_id = r.role_id
  LEFT JOIN 
    master tl ON e.team_leader_id = tl.id
  LEFT JOIN 
    master m ON e.manager_id = m.id
  LEFT JOIN 
    bank_details bd ON e.emp_id = bd.emp_id
  LEFT JOIN 
    personal_information ed ON e.emp_id = ed.emp_id
  LEFT JOIN 
    educational_background eb ON e.emp_id = eb.emp_id
  WHERE 
    e.emp_id = ? ; 
`;

  
  db.query(query,[emp_id] ,(err, result) => {
    if (err) {
      console.error("Error fetching employee:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch employee",
        details: err,
      });
    }
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched employee",
      data: result[0], // Return single object instead of array
    });
  });
  
});

// Update user status
addUserRoutes.put('/updateUserStatus', (req, res) => {

  let { id, empStatus, empManager, empTeamLeader, workEmail, empPassword } = req.body;
  const last_updated_status= 'Activated';
  const last_updated_time= new Date();
  console.log(req.body)

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Employee ID (id) is required"
    });
  }

  // Validate required fields
  const missingFields = [];
  if (!empStatus) missingFields.push("empStatus");
  if (!empManager) missingFields.push("empManager");
  if (!empTeamLeader) missingFields.push("empTeamLeader");
  if (!workEmail) missingFields.push("workEmail");
  if (!empPassword) missingFields.push("empPassword");

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Required fields missing",
      missingFields
    });
  }

  // Fetch emp_id first before updating
  const getEmpIdQuery = "SELECT emp_id FROM master WHERE id = ?";
  db.query(getEmpIdQuery, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch employee record",
        details: err
      });
    }

    let newEmpId = result[0]?.emp_id || null;

    if (!newEmpId) {
      // Generate emp_id if not present
      const getLastEmployeeIdQuery = "SELECT emp_id FROM master WHERE emp_id IS NOT NULL ORDER BY emp_id DESC LIMIT 1";

      db.query(getLastEmployeeIdQuery, (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Failed to fetch last employee ID",
            details: err
          });
        }

        if (result.length > 0 && result[0].emp_id) {
          const lastEmpNumber = parseInt(result[0].emp_id.split('-')[1]); 
          newEmpId = `NKT-${String(lastEmpNumber + 1).padStart(3, '0')}`;
        } else {
          newEmpId = `NKT-001`;
        }

        console.log('Generated emp_id:', newEmpId);
        // Now update employee details with the generated emp_id
        updateEmployeeDetails(newEmpId);
      });
    } else {
      // emp_id already exists, proceed with update
      console.log('Using existing emp_id:', newEmpId);
      updateEmployeeDetails(newEmpId);
    }
  });

  function updateEmployeeDetails(empIdToUse) {
    const updateQuery = `
      UPDATE master SET 
        emp_status = ?, 
        manager_id = ?, 
        team_leader_id= ?, 
        emp_email = ?, 
        emp_password = ?, 
        last_updated_status =?, 
        last_updated_time =?,
        emp_id = ?
      WHERE id = ?
    `;

  db.query(updateQuery, [empStatus, empManager, empTeamLeader, workEmail, empPassword,last_updated_status,last_updated_time,empIdToUse, id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to update employee status",
          details: err
        });
      }

      return res.json({
        success: true,
        message: "Employee details updated successfully",
        empId: empIdToUse
      });
    });
  }
});
addUserRoutes.put('/updateEmploymentStatus', (req, res) => {
  let { id, newDesignation, newStatus, newMobileNumber, newTeamLeader, newManager } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: "Employee ID is required" });
  }

  const updateQuery = `
    UPDATE master 
    SET 
      emp_empstatus = ?, 
      emp_designation = ?, 
      emp_phone_no = ?, 
      team_leader_id = ?, 
      manager_id = ? 
    WHERE id = ?
  `;

  db.query(updateQuery, [newStatus, newDesignation, newMobileNumber, newTeamLeader, newManager, id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, error: "Failed to update employment details", details: err });
    }

    return res.json({ success: true, message: "Employment details updated successfully" });
  });
});


addUserRoutes.post("/resigned_employees", (req, res) => {
  const { emp_id, employee_name, last_working_day, total_work_period, last_ctc_drawn, last_designation, reason_for_resignation,
     feedback, exit_interview_done, notice_period_served,emp_status,emp_empstatus } = req.body;

  const resigntablequery = `INSERT INTO resigned_emp 
    (emp_id, employee_name, last_working_day, total_work_period, last_ctc_drawn, last_designation, reason_for_resignation,
     feedback, exit_interview_done, notice_period_served) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
 
  const mastertableresignquery=  `
  UPDATE master 
  SET 
    emp_empstatus = ?, 
    emp_status=?
   WHERE emp_id = ?
`;

  db.query(resigntablequery, 
    [emp_id, employee_name, last_working_day, total_work_period, last_ctc_drawn, last_designation, reason_for_resignation, feedback, exit_interview_done, notice_period_served], 
    (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "Resignation details saved successfully" });
    }
  );
  db.query(mastertableresignquery, [emp_empstatus, emp_status, emp_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, error: "Failed to update employment details", details: err });
    }

    return res.json({ success: true, message: "Employment details updated successfully" });
  });
});


addUserRoutes.get("/fetch_resigned_employees", (req, res) => {
  db.query("SELECT * FROM resigned_emp", (error, rows) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(rows);
  });
});

// Delete user
addUserRoutes.delete('/deleteUser/:empId', (req, res) => {
  const { empId } = req.params;

  if (!empId) {
    return res.status(400).json({
      success: false,
      error: "Employee ID is required"
    });
  }

  const query = "DELETE FROM master WHERE emp_id = ?";

  db.query(query, [empId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete user",
        details: err
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully"
    });
  });
});

// fetch Department by 
addUserRoutes.get('/fetchDepartment/:id', (req, res) => {
  const { id } = req.params;
  console.log("Department ID received:", id);

  const query = `SELECT * FROM department WHERE dep_id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch department",
        details: err.message
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.json({
      success: true,
      message: "Department fetched successfully",
      department: result[0]
    });
  });
});

//fetch Designation by
addUserRoutes.get('/fetchDesignation/:id', (req, res) => {
  const { id } = req.params;
  console.log("Designation ID received:", id);

  const query = `SELECT * FROM designation WHERE designation_id = ?;`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch designation",
        details: err.message
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Designation not found"
      });
    }

    res.json({
      success: true,
      message: "Designation fetched successfully",
      designation: result[0]
    });
  });
});


// Update route to handle emergency contact update
addUserRoutes.put('/updateEmergencyContact/:id', (req, res) => {
  const { id } = req.params; // Extract employee ID from URL
  const { emergency_person_name, emergency_relationship, emergency_address, emergency_mob_no } = req.body;

  // SQL query to update the emergency contact details
  const updateQuery = `
    UPDATE personal_information 
    SET 
      emergency_person_name = ?, 
      emergency_relationship = ?, 
      emergency_address = ?, 
      emergency_mob_no = ? 
    WHERE emp_id = ?`;

  // Execute the query
  db.execute(updateQuery, [
    emergency_person_name, 
    emergency_relationship, 
    emergency_address, 
    emergency_mob_no, 
    id // The employee ID to update
  ], (err, results) => {
    if (err) {
      console.error('Error updating emergency contact:', err);
      return res.status(500).send({ success: false, error: err.message });
    }

    // Check if the employee was found and updated
    if (results.affectedRows === 0) {
      return res.status(404).send({ success: false, error: "Employee not found" });
    }

    // Successfully updated
    res.send({ success: true, message: "Emergency contact updated successfully" });
  });
});

// update updatePersonal-Information

addUserRoutes.put('/updatePersonal-Information/:id', (req, res) => {
  const { id } = req.params; // Extract employee ID from URLconst { id } = req.params; // Extract employee ID from URL
  const {
    permanent_address,
    permanent_city,
    permanent_state,
    permanent_zip_code,
    current_address,
    current_city,
    current_state,
    current_zip_code,
    alternate_mob_no,
    emergency_person_name,
    emergency_relationship,
    emergency_mob_no,
    emergency_address,
    marital_status
  } = req.body;

  // SQL query to update the employee details
  const updateQuery = `
    UPDATE personal_information 
    SET 
      permanent_address = ?, 
      permanent_city = ?, 
      permanent_state = ?, 
      permanent_zip_code = ?, 
      current_address = ?, 
      current_city = ?, 
      current_state = ?, 
      current_zip_code = ?, 
      alternate_mob_no = ?, 
      emergency_person_name = ?, 
      emergency_relationship = ?, 
      emergency_mob_no = ?, 
      emergency_address = ?, 
      marital_status = ? 
    WHERE emp_id = ?`;

  // Execute the query
  db.execute(updateQuery, [
    permanent_address, 
    permanent_city, 
    permanent_state, 
    permanent_zip_code, 
    current_address, 
    current_city, 
    current_state, 
    current_zip_code, 
    alternate_mob_no, 
    emergency_person_name, 
    emergency_relationship, 
    emergency_mob_no, 
    emergency_address, 
    marital_status, 
    id // The employee ID to update
  ], (err, results) => {
    if (err) {
      console.error('Error updating employee details:', err);
      return res.status(500).send({ success: false, error: err.message });
    }

    // Check if the employee was found and updated
    if (results.affectedRows === 0) {
      return res.status(404).send({ success: false, error: "Employee not found" });
    }

    // Successfully updated
    res.send({ success: true, message: "Employee details updated successfully" });
  });  
});

// Update employee educational details
addUserRoutes.put("/updateEducation/:emp_id", async (req, res) => {
  const { emp_id } = req.params;
  const { degree, institution, year_of_passing } = req.body;

  // Validation: Check if required fields are provided
  if (!degree || !institution || !year_of_passing) {
    return res.status(400).json({
      success: false,
      error: "All fields (degree, institution, year_of_passing) are required.",
    });
  }

  // Query to update education details
  const query = `UPDATE educational_background SET degree = ?, institution = ?, year_of_passing = ? WHERE emp_id = ?`;

  db.query(query, [degree, institution, year_of_passing, emp_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update education details",
        details: err.message,
      });
    }

    // Check if the employee was found and updated
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found or no changes made",
      });
    }

    // Successfully updated the education details
    return res.json({
      success: true,
      message: "Education details updated successfully",
    });
  });
});

 
// Update employee back A/C
addUserRoutes.put("/updateBankDetails/:emp_id", async (req, res) => {
  const { emp_id } = req.params;
  const { account_holder_name, bank_name, branch_name, account_no, IFSC_code } = req.body;

  // Validation: Check if required fields are provided
  if (!account_holder_name || !bank_name || !branch_name || !account_no || !IFSC_code) {
    return res.status(400).json({
      success: false,
      error: "All fields (account_holder_name, bank_name, branch_name, account_no, IFSC_code) are required.",
    });
  }

  // Query to update bank details
  const query = `UPDATE bank_details 
                 SET account_holder_name = ?, bank_name = ?, branch_name = ?, account_no = ?, IFSC_code = ? 
                 WHERE emp_id = ?`;

  db.query(query, [account_holder_name, bank_name, branch_name, account_no, IFSC_code, emp_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update bank details",
        details: err.message,
      });
    }

    // Check if the employee was found and updated
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found or no changes made",
      });
    }

    // Successfully updated the bank details
    return res.json({
      success: true,
      message: "Bank details updated successfully",
    });
  });
});
 
addUserRoutes.put('/updatePersonalIdentity/:emp_id', (req, res) => {
  const { emp_id } = req.params;
  const { emp_addhar_no, emp_pan_card_no } = req.body;

  console.log("Updating employee:", emp_id);
  console.log("Request Body:", req.body);

  // SQL Query to update employee's personal identity
  const query = `
    UPDATE master
    SET emp_addhar_no = ?, emp_pan_card_no = ?
    WHERE emp_id = ?;
  `;
  
  // Execute the query
  db.query(query, [emp_addhar_no, emp_pan_card_no, emp_id], (err, result) => {
    if (err) {
      console.error("Error updating employee:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    console.log("Employee updated successfully:", result);
    res.json({ success: true, message: "Employee updated successfully" });
  });
});


addUserRoutes.put('/updateNamemarital_status/:id', (req, res) => {
  const { id } = req.params;
  const { emp_name, marital_status } = req.body;

  console.log("Updating employee:", id);
  console.log("Request Body:", req.body);

  if (!emp_name || !marital_status) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Update name in `master` table
  const updateMasterQuery = `UPDATE master SET emp_full_name = ? WHERE emp_id = ?`;

  // Update marital status in `personal_details` table
  const updatePersonalQuery = `UPDATE personal_information SET marital_status = ? WHERE emp_id = ?`;

  db.query(updateMasterQuery, [emp_name, id], (err, result1) => {
    if (err) {
      console.error("Error updating master table:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    db.query(updatePersonalQuery, [marital_status, id], (err, result2) => {
      if (err) {
        console.error("Error updating personal_details table:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      console.log("Employee updated successfully");
      res.json({ success: true, message: 'Employee updated successfully' });
    });
  });
});

export default addUserRoutes;