import express from 'express';
import db from '../config/dbControl.js';
import transporter from '../config/mailConfig.js';
const taskBoxRouters = express.Router();  // Renamed variable for clarity
taskBoxRouters.get('/task-box/:id', (req, res) => {
    const { id } = req.params;
    
    // Use parameterized query to prevent SQL injection
    const taskFind = 'SELECT * FROM employee_task_box WHERE emp_id = ?';  // Renamed variable
    
    db.query(taskFind, [id], (err, result) => {
        if (err) {
            console.error(err);  // Log error
            return res.status(500).json({ message: 'Internal Server Error' });  // Send error response
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this employee.' });  // No data found
        }
        
        res.status(200).json(result);  // Send response with tasks data
    });
    
});

taskBoxRouters.get('/getmail', (req, res) => {
    const query = 'SELECT * FROM stores_mail_account';  // Renamed variable
    
    db.query(query, (err, result) => {
        if (err) {
            console.error(err);  // Log error
            return res.status(500).json({ message: 'Internal Server Error' });  // Send error response
        }
        
        if (result.length === 0) {
            return res.status(200).json({ message: 'No pending tasks.' });  // No pending tasks found
        }
        
        res.status(200).json(result);  // Send response with pending tasks data
    });
});  

taskBoxRouters.post('/setmail',async (req, res) => {
   
   
    const {empId,empName,emp_email,taskId,taskName,reasonType,extendedDate,reasonText,recipientEmail} = req.body;
   
    // Email content
    const mailOptions = {
        from: `${emp_email}`, // Sender email
        to: recipientEmail, // Recipient email
        subject: `Task Update: ${taskName} (ID: ${taskId})`,
        html: `
          <h3>Task Update Notification</h3>
          <p><strong>Task Name:</strong> ${taskName}</p>
          <p><strong>Task ID:</strong> ${taskId}</p>
          <p><strong>Assigned By:</strong> ${empName} , email id ${emp_email} (Employee ID: ${empId})</p>
          <p><strong>Reason Type:</strong> ${reasonType}</p>
          ${
            extendedDate
              ? `<p><strong>Extended Deadline:</strong> ${extendedDate}</p>`
              : ""
          }
          <p><strong>Reason Description:</strong> ${reasonText}</p>
          <p>Regards,</p>
          <p><strong>HR TaskBox</strong></p>
        `,
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully.' });

    

   
});
  

export default taskBoxRouters;  // Renamed variable
