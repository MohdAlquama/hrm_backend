import express from "express";
import db from "../config/dbControl.js";
import upload from "../controllers/uploadControllers.js";
import cloudinary from "../config/cloudinaryConfig.js";

const uploadDocumentRouter = express.Router();

uploadDocumentRouter.post('/uploading', upload.fields([
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'degree', maxCount: 1 },
  { name: 'highSchoolMarksheet', maxCount: 1 },
  { name: 'intermediateMarksheet', maxCount: 1 }
]), async function(req, res) {
  try {
    const { employeeId } = req.body; // Retrieve employee ID
    const documents = req.files; // Get the uploaded files

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    if (!documents || Object.keys(documents).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const date = new Date();
    const mysqlFormattedDate = date.toISOString().slice(0, 19).replace("T", " ");

    // Iterate over the documents and upload them to Cloudinary
    for (const [docType, files] of Object.entries(documents)) {
      const file = files[0]; // Only the first file
      const uploadResult = await cloudinary.uploader.upload(file.path);
      const filename = uploadResult.secure_url; // Get the file URL

      // Insert each document into the database
      const insertDocQuery = `
        INSERT INTO upload_document (emp_id, doc_title, doc_url, doc_status, doc_apply_date)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(insertDocQuery, [employeeId, docType, filename, 'Pending', mysqlFormattedDate], function (err) {
        if (err) {
          console.error('Database Insert Error:', err);
          return res.status(500).json({ message: 'Error uploading document', error: err });
        }
      });
    }

    res.status(200).json({ message: 'Documents uploaded successfully' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error uploading documents', error: error.message });
  }
});

uploadDocumentRouter.get('/getdocuments/:user_id', async function (req, res) {
  try {
    const { user_id } = req.params;

    // MySQL query to fetch documents by user_id
    const selectDocsQuery = `
      SELECT doc_id, doc_title, doc_url, doc_status, doc_apply_date
      FROM upload_document
      WHERE emp_id = ?
      ORDER BY doc_apply_date DESC
    `;

    db.query(selectDocsQuery, [user_id], function (err, results) {
      if (err) {
        console.error('Database Fetch Error:', err);
        return res.status(500).json({ message: 'Error fetching documents', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No documents found for this user' });
      }

      res.status(200).json({ documents: results });
    });

  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

export default uploadDocumentRouter;
