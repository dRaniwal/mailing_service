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

  const data = req.body;

  const {
    brandName,
    brandWebsite,
    socialHandles,
    niches,
    campaignName,
    campaignType,
    campaignDescription,
    tagline,
    productName,
    productWebsite,
    productDescription,
    productFeatures,
    launchStatus,
    idealAudience,
    targetStates,
    ageRange,
    budget,
    contentTypes,
    creatorTier,
    creatorPackage,
    addCollabTag,
    shippingProductLink,
    retailValue,
    isMRP,
    barterDiscount
  } = data;

  // ✅ Basic validations
  if (!brandName || !brandWebsite || !campaignName || !campaignType || !campaignDescription) {
    return res.status(400).json({ message: 'Missing required campaign fields.' });
  }


  if (campaignType === 'Product Marketing') {
    if (!productName || !productWebsite) {
      return res.status(400).json({ message: 'Missing product fields for Product Marketing campaign.' });
    }
  }

  // ✅ Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // ✅ Format email body
  const htmlBody = `
    <h2>New Campaign Submission</h2>
    <p><strong>Brand:</strong> ${brandName}</p>
    <p><strong>Website:</strong> ${brandWebsite}</p>
    <p><strong>Social Handles:</strong> ${socialHandles || 'N/A'}</p>
    <p><strong>Niches:</strong> ${niches || 'N/A'}</p>
    <p><strong>Campaign Name:</strong> ${campaignName}</p>
    <p><strong>Campaign Type:</strong> ${campaignType}</p>
    <p><strong>Description:</strong> ${campaignDescription}</p>
    <p><strong>Tagline:</strong> ${tagline || 'N/A'}</p>
    
    ${campaignType === 'Product Marketing' ? `
      <h3>Product Info</h3>
      <p><strong>Product Name:</strong> ${productName}</p>
      <p><strong>Product Website:</strong> ${productWebsite}</p>
      <p><strong>Description:</strong> ${productDescription || 'N/A'}</p>
      <p><strong>Features:</strong> ${productFeatures?.join(', ') || 'N/A'}</p>
      <p><strong>Shipping Product Link:</strong> ${shippingProductLink || 'N/A'}</p>
      <p><strong>Retail Value:</strong> ${retailValue || 'N/A'}</p>
      <p><strong>MRP:</strong> ${isMRP ? 'Yes' : 'No'}</p>
      <p><strong>Barter Discount:</strong> ${barterDiscount ? 'Yes' : 'No'}</p>
    ` : ''}

    <h3>Audience & Targeting</h3>
    <p><strong>Launch Status:</strong> ${launchStatus}</p>
    <p><strong>Ideal Audience:</strong> ${idealAudience || 'N/A'}</p>
    <p><strong>Target States:</strong> ${targetStates || 'N/A'}</p>
    <p><strong>Age Range:</strong> ${ageRange}</p>

    <h3>Execution</h3>
    <p><strong>Budget:</strong> ₹${budget}</p>
    <p><strong>Content Types:</strong> ${contentTypes?.join(', ')}</p>
    <p><strong>Creator Tier:</strong> ${creatorTier}</p>
    <p><strong>Creator Package:</strong> ${creatorPackage}</p>
    <p><strong>Add Collab Tag:</strong> ${addCollabTag ? 'Yes' : 'No'}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Campaign Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Campaign: ${campaignName}`,
      html: htmlBody
    });

    return res.status(200).json({ message: 'Campaign submitted successfully!' });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ message: 'Email failed to send.', error: error.message });
  }
}
