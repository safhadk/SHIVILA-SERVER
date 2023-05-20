import nodemailer from 'nodemailer'

export const sendEmail = async (email) => {
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: 'Subscription Activated',
      text: `Congratulations! Your subscription has been activated for 6 months. Now you have access to all premium features.`
    }
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`Error sending Mail: ${err.message}`);
    return res.status(err.status || 500).send('Internal Server Error');
  }
}