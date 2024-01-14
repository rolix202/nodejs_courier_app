import { Router } from "express";
import nodemailer from "nodemailer";
import sanitizeHtml from 'sanitize-html';

const router = Router();

const sendEmail = async (contactName, phoneNumber, email, message) => {
    const output = `
      <h4>You have a new message</h4>
      <h2>Message Details</h2>
      <ul>
          <li>Name: ${sanitizeHtml(contactName)} </li>
          <li>Phone Number: ${sanitizeHtml(phoneNumber)} </li>
          <li>Email: ${sanitizeHtml(email)} </li>
      </ul>
      <h3>Message</h3>
      <p>${sanitizeHtml(message)} </p>
    `;
  
    const transporter = nodemailer.createTransport({
      service: 'Zoho',
      host: 'smtp.zoho.com',
      port: 587,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
      
    });
  
    try {
      const info = await transporter.sendMail({
        from: '"Roland 👻" <admin@crossborderlogisticsinc.com>',
        to: 'admin@crossborderlogisticsinc.com',
        subject: 'Crossborder Logistcis Inc Enquiry Message',
        html: output,
      });
  
      return info.messageId;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  };
  
  router.post('/submitMessage', async (req, res) => {
    try {
      const { contactName, phoneNumber, email, message } = req.body;
  
      // Basic form validation
      if (!contactName || !phoneNumber || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  
      const messageId = await sendEmail(contactName, phoneNumber, email, message);
      res.status(200).json({ msg: 'Message sent', messageId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to submit the form. Please try again.' });
    }
  });
export default router;
