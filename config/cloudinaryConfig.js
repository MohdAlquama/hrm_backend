
// Import the v2 version of Cloudinary
import { v2 as cloudinary } from "cloudinary";


// Load environment variables from .env file


// Configure Cloudinary with your credentials from the .env file
cloudinary.config({
    cloud_name: 'ddfddmke7', 
    api_key: '235154445999174', 
    api_secret: 'OBdZEFHYMR2BQXB3tzPwBkismFg'
});

// Export the configured Cloudinary instance
export default cloudinary;
