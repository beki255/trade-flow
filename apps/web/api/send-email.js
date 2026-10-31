import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-TradeFlow-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-tradeflow-secret'];
  if (secret !== 'tradeflow_super_secret_relay_2026') {
    return res.status(401).json({ error: 'Unauthorized relay request' });
  }

  const { to, subject, html, text } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'bereket2553@gmail.com',
        pass: 'hbfbeqofmyiuhfxl',
      },
    });

    const info = await transporter.sendMail({
      from: '"TradeFlow Security" <bereket2553@gmail.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ' '),
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Vercel SMTP Relay error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
