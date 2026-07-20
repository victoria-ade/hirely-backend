const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  console.log('Attempting to send email to:', to);
  console.log('EMAIL_USER configured:', !!process.env.EMAIL_USER);
  console.log('EMAIL_PASS configured:', !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Hirely" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log('Email sent successfully:', info.messageId);
  return info;
};

module.exports = sendEmail;