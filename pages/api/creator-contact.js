import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://campayn.in');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const {
    instagramUsername,
    highestViews,
    lowestViews,
    highestLikes,
    lowestLikes,
    fullName,
    email,
    whatsapp,
    message,
    termsAgreed
  } = req.body;

  // Validate required fields
  if (!instagramUsername || !highestViews || !lowestViews || !highestLikes || !lowestLikes || 
      !fullName || !email || !whatsapp || !message || !termsAgreed) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate message length
  if (message.length < 20) {
    return res.status(400).json({ message: 'Message must be at least 20 characters long' });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Format email body
  const htmlBody = `
    <h2>New Creator Contact Form Submission</h2>
    <p><strong>Instagram Username:</strong> ${instagramUsername}</p>
    <p><strong>Content Performance (Last 10 Reels):</strong></p>
    <p>Views Range: ${lowestViews} - ${highestViews}</p>
    <p>Likes Range: ${lowestLikes} - ${highestLikes}</p>
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
    <p><strong>Terms Agreed:</strong> ${termsAgreed ? 'Yes' : 'No'}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Creator Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Creator Contact: ${instagramUsername}`,
      html: htmlBody
    });

    return res.status(200).json({ message: 'Form submitted successfully!' });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
} 