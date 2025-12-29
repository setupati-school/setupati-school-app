import nodemailer from 'nodemailer';
import logger from './logger.js';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Email credentials not configured. Skipping email send.');
      return false;
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const validEmails = recipients.filter((email) => email && email.includes('@'));

    if (validEmails.length === 0) {
      logger.warn('No valid email recipients found.');
      return false;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      bcc: validEmails,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${validEmails.length} recipient(s)`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

interface CircularEmailData {
  title: string;
  description: string;
  issued_by: string;
  issued_date: string;
  valid_until: string;
  targeted_group: string;
  attachment_url?: string | null;
}

export const sendCircularNotification = async (
  emails: string[],
  circular: CircularEmailData
): Promise<boolean> => {
  const subject = `New Circular: ${circular.title}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0B4F8A, #1171C4); color: white; padding: 25px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background-color: #f8fafc; padding: 25px; border: 1px solid #e2e8f0; border-top: none; }
        .content h2 { color: #0B4F8A; margin-top: 0; }
        .footer { background-color: #e8f0f8; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none; }
        .detail { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail:last-of-type { border-bottom: none; }
        .label { font-weight: bold; color: #0B4F8A; }
        .badge { display: inline-block; background-color: #0B4F8A; color: white; padding: 4px 14px; border-radius: 20px; font-size: 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #0B4F8A, #1171C4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: bold; }
        .button:hover { background: linear-gradient(135deg, #094070, #0E5FA3); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Circular Published</h1>
        </div>
        <div class="content">
          <h2>${circular.title}</h2>
          <p>${circular.description}</p>

          <div class="detail">
            <span class="label">Issued By:</span> ${circular.issued_by}
          </div>
          <div class="detail">
            <span class="label">Issued Date:</span> ${circular.issued_date}
          </div>
          <div class="detail">
            <span class="label">Valid Until:</span> ${circular.valid_until}
          </div>
          <div class="detail">
            <span class="label">Target Audience:</span>
            <span class="badge">${circular.targeted_group}</span>
          </div>

          ${circular.attachment_url ? `
          <div class="detail">
            <a href="${circular.attachment_url}" class="button">View Attachment</a>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification from Setupati School.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: emails, subject, html });
};
