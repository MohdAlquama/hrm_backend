import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoDB from './config/dbControl.js'; // Import MongoDB connection function
import authRoutes from './routes/authRoutes.js';
import addUserRoutes from './routes/addUserRoutes1.js';
import leaveRoutes from './routes/leaveRoutes.js';  
import uploadDocumentRouter from './routes/uploadDocumentRouter.js';
import tastBoxRouters from './routes/tastBoxRouters.js';
 
const app = express();
const PORT = 5000;
 
app.use(cors());
app.use(express.json());
app.use(cookieParser());
 
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,  
  cookie: {
    httpOnly: true,  
    secure: false,  
    maxAge: 1000 * 60 * 60 * 24,
  },
}));
 
// Connect to MongoDB
const uri = 'mongodb+srv://injilanaureen:12345qwer@clusterhrms.5wcsb.mongodb.net/?retryWrites=true&w=majority&appName=Clusterhrms';
MongoDB({ url: uri });
 
// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/adduser', addUserRoutes);
// app.use('/api/leave', leaveRoutes);
// app.use('/api/upload', uploadDocumentRouter);
// app.use('/api/tastbox', tastBoxRouters);
 
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 
 