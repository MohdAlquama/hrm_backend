import multer from 'multer';
  // Import the path module to handle path creation

// Configure multer's storage
const storage = multer.diskStorage({
  
  // destination: function (req, file, cb) {
  //   cb(null, "assets"); // Specify the destination folder
  // },
  // filename: function (req, file, cb) {
  //   const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  //   // Ensure the file name follows the pattern you want
  //   const filename = file.fieldname + "-" + uniqueSuffix + "-" + file.originalname;
  //   cb(null, filename); // Generate a unique filename
  // },
});

// Create the upload middleware
const upload = multer({ storage });

export default upload;
