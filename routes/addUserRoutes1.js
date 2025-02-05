import express from 'express';
 
const addUserRoutes = express.Router();
 
// Fetch all roles (MongoDB example)
addUserRoutes.get('/fetchRole', async (req, res) => {
  const db = global.dbClient.db('hrmDB'); // Choose the database
  const collection = db.collection('role_and_permission'); // Choose the collection
 
  try {
    const roles = await collection.find().toArray();
    console.log(roles);
    return res.json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (err) {
    console.error("Error fetching roles:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch roles",
    });
  }
});
 
// Fetch role permissions (MongoDB example)
addUserRoutes.get('/getRolePermissions', async (req, res) => {
    const { role_id } = req.query;
    console.log("Role ID received:", role_id);
 
    // Ensure the role_id is an integer
    const roleIdInt = parseInt(role_id, 10);
 
    const db = global.dbClient.db('hrmDB'); // Choose the database
    const collection = db.collection('role_and_permission'); // Choose the collection for permissions
 
    try {
      // Query for role_id as an integer
      const permissions = await collection.find({ role_id: roleIdInt }).toArray();
 
      if (permissions.length > 0) {
        return res.json({
          success: true,
          permissions: permissions[0].permission, // Return 'permission' field
        });
      } else {
        return res.status(404).json({
          success: false,
          error: `Role not found or no permissions assigned for role_id: ${roleIdInt}`,
        });
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch permissions",
      });
    }
  });
 
// Fetch all departments (MongoDB example)
addUserRoutes.get('/fetchDepartment', async (req, res) => {
  const db = global.dbClient.db('hrmDB'); // Choose the database
  const collection = db.collection('department'); // Choose the collection for departments
 
  try {
    const departments = await collection.find().toArray();
    return res.json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (err) {
    console.error("Error fetching departments:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
});
 
// Fetch designations for a specific department (MongoDB example)
addUserRoutes.get('/fetchDesignation', async (req, res) => {
    const { dept_id } = req.query;
    console.log("Department ID received:", dept_id);
 
    // Log the data type of dept_id
    console.log("Data type of dept_id:", typeof dept_id);
 
    if (!dept_id) {
      return res.status(400).json({
        success: false,
        error: "Department ID is required",
      });
    }
 
    const db = global.dbClient.db('hrmDB'); // Choose the database
    const designationCollection = db.collection('designation'); // Choose the collection for designations
 
    try {
      // Aggregation to join department and designation collections
      const designations = await designationCollection.aggregate([
        {
          $match: { dept_id: parseInt(dept_id) }, // Ensure dept_id is treated as a number
        },
        {
          $lookup: {
            from: 'department', // The collection to join
            localField: 'dept_id', // The field in designation collection
            foreignField: 'dept_id', // The field in department collection
            as: 'department_info', // The resulting array of department info
          },
        },
        {
          $unwind: { path: '$department_info', preserveNullAndEmptyArrays: true }, // Flatten the department info
        },
      ]).toArray();
 
      if (designations.length > 0) {
        return res.json({
          success: true,
          message: "Designations fetched successfully",
          data: designations,
        });
      } else {
        return res.status(404).json({
          success: false,
          error: `No designations found for department ID: ${dept_id}`,
        });
      }
    } catch (err) {
      console.error("Error fetching designations:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch designations",
        details: err.message,
      });
    }
  });
 
 
 
// Add new user (MongoDB example)
addUserRoutes.post('/submitUser', async (req, res) => {
  const db = global.dbClient.db('hrmDB'); // Choose the database
  const collection = db.collection('master'); // Choose the collection for users
 
  const newUser = req.body;
 
  try {
    const result = await collection.insertOne(newUser); // Insert user into MongoDB
    return res.json({
      success: true,
      message: "User data submitted successfully",
      data: { id: result.insertedId },
    });
  } catch (err) {
    console.error("Error submitting user data:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to submit user data",
    });
  }
});
// Fetch all employees (MongoDB example)
addUserRoutes.get('/getAllEmployees', async (req, res) => {
  const db = global.dbClient.db('hrmDB'); // Choose the database
  const collection = db.collection('master'); // Choose the collection for employees
 
  try {
    // Aggregate query to join employees with departments, designations, roles, team leaders, and managers
    const employees = await collection.aggregate([
      {
        $lookup: {
          from: 'department', // Department collection
          localField: 'emp_department', // Field in master collection
          foreignField: 'dep_id', // Field in department collection
          as: 'department_info',
        },
      },
      {
        $lookup: {
          from: 'designation', // Designation collection
          localField: 'emp_designation', // Field in master collection
          foreignField: 'designation_id', // Field in designation collection
          as: 'designation_info',
        },
      },
      {
        $lookup: {
          from: 'role_and_permission', // Role and permission collection
          localField: 'role_id', // Field in master collection
          foreignField: 'role_id', // Field in role_and_permission collection
          as: 'role_info',
        },
      },
      {
        $lookup: {
          from: 'master', // Master collection (for team leaders)
          localField: 'team_leader_id', // Field in master collection
          foreignField: '_id', // Field in master collection for team leader
          as: 'team_leader_info',
        },
      },
      {
        $lookup: {
          from: 'master', // Master collection (for managers)
          localField: 'manager_id', // Field in master collection
          foreignField: '_id', // Field in master collection for manager
          as: 'manager_info',
        },
      },
      {
        $project: {
          emp_id: 1,
          emp_full_name: 1,
          emp_department: { $arrayElemAt: ['$department_info.dep_name', 0] }, // Get department name from department_info
          emp_designation: { $arrayElemAt: ['$designation_info.designation_name', 0] }, // Get designation name from designation_info
          emp_confirmation_date: 1,
          emp_empstatus: 1,
          last_updated_time: 1,
          last_updated_status: 1,
          emp_offered_ctc: 1,
          emp_personal_email: 1,
          emp_phone_no: 1,
          emp_addhar_no: 1,
          emp_pan_card_no: 1,
          emp_join_date: 1,
          emp_status: 1,
          role_name: { $arrayElemAt: ['$role_info.role', 0] }, // Get role name from role_info
          permission: { $arrayElemAt: ['$role_info.permission', 0] }, // Get permission from role_info
          team_leader_name: { $arrayElemAt: ['$team_leader_info.emp_full_name', 0] }, // Get team leader name
          manager_name: { $arrayElemAt: ['$manager_info.emp_full_name', 0] }, // Get manager name
        },
      },
    ]).toArray();
 
    return res.status(200).json({
      success: true,
      message: "Successfully fetched employees",
      data: employees,
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      details: err,
    });
  }
});
 
 
// // Fetch all roles (MongoDB example)
// addUserRoutes.get('/fetchRole', async (req, res) => {
//     const db = global.dbClient.db('hrmDB'); // Choose the database
//     const collection = db.collection('role_and_permission'); // Choose the collection for roles
   
//     try {
//       // Fetch all roles from the role_and_permission collection
//       const roles = await collection.find().toArray();
     
//       return res.json({
//         success: true,
//         message: "Roles fetched successfully",
//         data: roles,
//       });
//     } catch (err) {
//       console.error("Error fetching roles:", err);
//       return res.status(500).json({
//         success: false,
//         error: "Failed to fetch roles",
//         details: err,
//       });
//     }
//   });
 
  addUserRoutes.get('/getRolePermissions', async (req, res) => {
    const db = global.dbClient.db('hrmDB'); // Select the database
    const collection = db.collection('role_and_permission'); // Select the collection for roles
 
    const { role_id } = req.query;
    console.log("Role ID received:", role_id);
 
    if (!role_id) {
        return res.status(400).json({
            success: false,
            error: "Missing role_id parameter",
        });
    }
 
    try {
        // Convert role_id to an integer if it's stored as a number in MongoDB
        const query = { role_id: isNaN(role_id) ? role_id : parseInt(role_id) };
 
        // Find the role based on role_id
        const role = await collection.findOne(query);
 
        if (role) {
            return res.json({
                success: true,
                permissions: role.permission,
            });
        } else {
            return res.status(404).json({
                success: false,
                error: "Role not found",
            });
        }
    } catch (err) {
        console.error("Error fetching permissions:", err);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch permissions",
            details: err,
        });
    }
});
 
addUserRoutes.get('/getSingleEmployee/:emp_id', async (req, res) => {
    const { emp_id } = req.params; // Get the emp_id from the URL params
 
    // Make sure emp_id is treated as a string
    if (typeof emp_id !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Invalid emp_id format",
      });
    }
 
    const db = global.dbClient.db('hrmDB'); // Access the database
    const employeeCollection = db.collection('master'); // Access the collection for employees
   
    try {
      // Find the employee by emp_id
      const employee = await employeeCollection.aggregate([
        {
          $match: { emp_id: emp_id }, // Match the emp_id as a string
        },
        {
          $lookup: {
            from: 'department', // Join with department collection
            localField: 'emp_department', // Field in employee collection
            foreignField: 'dep_id', // Field in department collection
            as: 'emp_department', // Alias for department info
          },
        },
        {
          $lookup: {
            from: 'designation', // Join with designation collection
            localField: 'emp_designation', // Field in employee collection
            foreignField: 'designation_id', // Field in designation collection
            as: 'emp_designation', // Alias for designation info
          },
        },
        {
          $lookup: {
            from: 'role_and_permission', // Join with role_and_permission collection
            localField: 'role_id', // Field in employee collection
            foreignField: 'role_id', // Field in role_and_permission collection
            as: 'role_info', // Alias for role info
          },
        },
        {
          $lookup: {
            from: 'bank_details', // Join with bank_details collection
            localField: 'emp_id', // Field in employee collection
            foreignField: 'emp_id', // Field in bank_details collection
            as: 'bank_details', // Alias for bank details
          },
        },
        {
          $lookup: {
            from: 'personal_information', // Join with personal_information collection
            localField: 'emp_id', // Field in employee collection
            foreignField: 'emp_id', // Field in personal_information collection
            as: 'personal_information', // Alias for personal information
          },
        },
        {
          $lookup: {
            from: 'educational_background', // Join with educational_background collection
            localField: 'emp_id', // Field in employee collection
            foreignField: 'emp_id', // Field in educational_background collection
            as: 'educational_background', // Alias for educational background
          },
        },
      ]).toArray(); // Convert the aggregation result into an array
 
      if (employee.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }
 
      return res.status(200).json({
        success: true,
        message: "Successfully fetched employee",
        data: employee[0], // Return the first matching employee
      });
    } catch (err) {
      console.error("Error fetching employee:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch employee",
        details: err.message,
      });
    }
  });
 
 
 
// addUserRoutes.get('/fetchDesignation/:id', async (req, res) => {
//     const db = global.dbClient.db('hrmDB'); // Select the database
//     const collection = db.collection('designation'); // Select the collection for designations
 
//     const { id } = req.params;
//     console.log("Designation ID received:", id);
 
//     if (!id) {
//         return res.status(400).json({
//             success: false,
//             error: "Missing designation ID parameter",
//         });
//     }
 
//     try {
//         // Convert id to an integer if it's stored as a number in MongoDB
//         const query = { designation_id: isNaN(id) ? id : parseInt(id) };
 
//         // Find the designation based on designation_id
//         const designation = await collection.findOne(query);
 
//         if (!designation) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Designation not found",
//             });
//         }
 
//         res.json({
//             success: true,
//             message: "Designation fetched successfully",
//             designation,
//         });
 
//     } catch (err) {
//         console.error("Error fetching designation:", err);
//         return res.status(500).json({
//             success: false,
//             error: "Failed to fetch designation",
//             details: err.message,
//         });
//     }
// });
 


addUserRoutes.put('/updateEmergencyContact/:id', async (req, res) => {
  console.log('Request body:', req.body); // Log the request body
  const { id } = req.params;
  const { emergency_person_name, emergency_relationship, emergency_address, emergency_mob_no } = req.body;

  if (!emergency_person_name || !emergency_relationship || !emergency_address || !emergency_mob_no) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required',
    });
  }

  try {
    const db = global.dbClient.db('hrmDB');
    const collection = db.collection('personal_information');

    const updateResult = await collection.updateOne(
      { emp_id: id },
      {
        $set: {
          emergency_person_name,
          emergency_relationship,
          emergency_address,
          emergency_mob_no,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found or no changes made' });
    }

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error); // Log detailed error
    res.status(500).json({ success: false, error: error.message });
  }
});




 
addUserRoutes.get('/getSingleEmployee/:emp_id', async (req, res) => {
  const { emp_id } = req.params;

  if (typeof emp_id !== 'string') {
      return res.status(400).json({
          success: false,
          error: "Invalid emp_id format",
      });
  }

  const db = global.dbClient.db('hrmDB');
  const employeeCollection = db.collection('master');
 
  try {
      const employee = await employeeCollection.aggregate([
          {
              $match: { emp_id: emp_id },
          },
          {
              $lookup: {
                  from: 'department',
                  localField: 'emp_department',
                  foreignField: 'dep_id',
                  as: 'emp_department_info',
              },
          },
          {
              $lookup: {
                  from: 'designation',
                  localField: 'emp_designation',
                  foreignField: 'designation_id',
                  as: 'emp_designation_info',
              },
          },
          {
              $lookup: {
                  from: 'role_and_permission',
                  localField: 'role_id',
                  foreignField: 'role_id',
                  as: 'role_info',
              },
          },
          {
              $lookup: {
                  from: 'bank_details',
                  localField: 'emp_id',
                  foreignField: 'emp_id',
                  as: 'bank_details',
              },
          },
          {
              $lookup: {
                  from: 'personal_information',
                  localField: 'emp_id',
                  foreignField: 'emp_id',
                  as: 'personal_information',
              },
          },
          {
              $lookup: {
                  from: 'educational_background',
                  localField: 'emp_id',
                  foreignField: 'emp_id',
                  as: 'educational_background',
              },
          },
          // Self-lookup to get Team Leader Name
          {
              $lookup: {
                  from: 'master',
                  localField: 'team_leader_id',
                  foreignField: 'emp_id',
                  as: 'team_leader_info',
              },
          },
          // Self-lookup to get Manager Name
          {
              $lookup: {
                  from: 'master',
                  localField: 'manager_id',
                  foreignField: 'emp_id',
                  as: 'manager_info',
              },
          },
          // Unwind the team leader and manager info arrays
          {
              $unwind: {
                  path: "$team_leader_info",
                  preserveNullAndEmptyArrays: true, // Ensure null if no team leader
              },
          },
          {
              $unwind: {
                  path: "$manager_info",
                  preserveNullAndEmptyArrays: true, // Ensure null if no manager
              },
          },
          {
              $project: {
                  emp_id: 1,
                  emp_full_name: 1,
                  emp_department: 1,
                  emp_designation: 1,
                  emp_confirmation_date: 1,
                  emp_empstatus: 1,
                  emp_offered_ctc: 1,
                  emp_personal_email: 1,
                  emp_phone_no: 1,
                  emp_addhar_no: 1,  // Aadhar Number
                  emp_pan_card_no: 1, // PAN Card Number
                  emp_gender: 1,
                  emp_dob: 1,
                  emp_join_date: 1,
                  emp_status: 1,
                  emp_email: 1,
                  emp_password: 1,
                  "emp_department": { $arrayElemAt: ["$emp_department_info.dep_name", 0] },
                  "emp_designation": { $arrayElemAt: ["$emp_designation_info.designation_name", 0] },
                  "role_name": { $arrayElemAt: ["$role_info.role", 0] },
                  "permission": { $arrayElemAt: ["$role_info.permission", 0] },
                  "team_leader_name": "$team_leader_info.emp_full_name",  // Name from unwound info
                  "manager_name": "$manager_info.emp_full_name",  // Name from unwound info
                  bank_details: 1,
                  personal_information: 1,
                  educational_background: 1,
              },
          }
         
         
      ]).toArray();

      if (employee.length === 0) {
          return res.status(404).json({
              success: false,
              message: "Employee not found",
          });
      }

      return res.status(200).json({
          success: true,
          message: "Successfully fetched employee",
          data: employee[0],
      });
  } catch (err) {
      console.error("Error fetching employee:", err);
      return res.status(500).json({
          success: false,
          error: "Failed to fetch employee",
          details: err.message,
      });
  }
});


export default addUserRoutes;
 
 