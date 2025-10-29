const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send password reset link
const sendPasswordResetLink = async (email, username, resetToken) => {
  try {
    const transporter = createTransporter();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'LeetCode Buddy <noreply@leetcode-Buddy.com>',
      to: email,
      subject: 'Reset Your Password - LeetCode Buddy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
            .link-box { background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              <p>We received a request to reset your password for your LeetCode Buddy account.</p>
              <p>Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-box">
                ${resetUrl}
              </div>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
              </div>
              <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              <p>Best regards,<br><strong>LeetCode Buddy Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2025 The Boring Company. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password
        
        Hello ${username},
        
        We received a request to reset your password for your LeetCode Buddy account.
        
        Click the link below to create a new password:
        ${resetUrl}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request a password reset, please ignore this email.
        
        Best regards,
        LeetCode Buddy Team
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetLink
};
