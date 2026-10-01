import nodemailer from 'nodemailer';
const sendEmail = async ({ to, subject, message }) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
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