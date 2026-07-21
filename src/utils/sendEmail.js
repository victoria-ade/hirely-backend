const { Resend } = require('resend');

const sendEmail = async ({ to, subject, html }) => {
  console.log('Attempting to send email to:', to);
  console.log('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'Hirely <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log('Email sent successfully:', data.id);
  return data;
};

module.exports = sendEmail;