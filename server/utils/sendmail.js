import nodemailer from 'nodemailer';
const sendEmail = async (to, subject, message) => {
  // Corrected method name to createTransport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Set to true if using port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text: message
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;