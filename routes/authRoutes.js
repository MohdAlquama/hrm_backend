import express from 'express';

const authRouter = express.Router();

// Login route with role-based authentication
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = global.dbClient.db('hrmDB'); // Access database using global client
    const collection = db.collection('master'); // Access 'master' collection
    const roleCollection = db.collection('role_and_permission'); // Access 'role_and_permission' collection

    // Find the user by email and password
    const user = await collection.findOne({ emp_email: email, emp_password: password });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check the role and permissions for the user
    const role = await roleCollection.findOne({ role_id: user.role_id });

    if (!role) {
      return res.status(403).json({ message: 'Role not found' });
    }

    // Send user data along with role and permission
    return res.json({
      isAuthenticated: true,
      emp_id: user.emp_id,
      emp_full_name: user.emp_full_name,
      emp_personal_email: user.emp_personal_email,
      emp_phone_no: user.emp_phone_no,
      emp_addhar_no: user.emp_addhar_no,
      emp_pan_card_no: user.emp_pan_card_no,
      emp_department: user.emp_department,
      emp_designation: user.emp_designation,
      emp_join_date: user.emp_join_date,
      emp_status: user.emp_status,
      role_id: user.role_id,
      role_permission: role.role_permission,  // Corrected to access role permission from the 'role' object
      emp_email: user.emp_email,
      emp_password: user.emp_password,
      role: role.role,  // Corrected to access role from the 'role' object
      permission: role.permission,  // Corrected to access permission from the 'role' object
    });
  } catch (error) {
    console.error("MongoDB error: ", error.message);
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
});


//CHANGE PASSWORD 

authRouter.put('/updateUserPassword', async (req, res) => {
  const { empId, oldPassword, newPassword } = req.body;
  console.log(req.body); // For debugging purposes, remove in production

  // Check if all required fields are provided
  if (!empId || !oldPassword || !newPassword) {
    return res.status(400).json({
      message: "empId, oldPassword, and newPassword are required",
    });
  }

  try {
    const db = global.dbClient.db('hrmDB'); // Access the database
    const collection = db.collection('master'); // Access 'master' collection

    // Find the user by emp_id and oldPassword
    const user = await collection.findOne({ emp_id: empId, emp_password: oldPassword });

    // If user is not found or passwords do not match
    if (!user) {
      return res.status(401).json({ message: 'Invalid emp_id or old password' });
    }

    // Ensure the new password is not the same as the old password
    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the old password' });
    }

    // Update password with the new password
    const updateResult = await collection.updateOne(
      { emp_id: empId }, // Matching emp_id
      { $set: { emp_password: newPassword } }
    );

    // Check if the password was successfully updated
    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to update password' });
    }

    return res.status(200).json({
      message: 'Password updated successfully',
      emp_id: empId, // Use empId from the request body
    });
  } catch (error) {
    console.error("MongoDB error: ", error.message);
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
});


export default authRouter;
