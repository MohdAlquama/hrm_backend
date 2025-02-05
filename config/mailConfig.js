import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mohdalquama01@gmail.com",
      pass: "jkrospmzdwqcqafn", // Use Gmail App Password, not your actual password
    },
  });

  export default transporter;