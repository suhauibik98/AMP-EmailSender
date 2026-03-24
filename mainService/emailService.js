const transporter = require("../config/emailConfig").transporter;

/**
 * Send emailTo based on action type
 * @param {string} emailTo - Recipient emailTo address
 * @param {string|string[]} actions - Action type(s) to determine emailTo content
 * @param {string} tempPassword - Temporary password for new users
 * @param {string} otp - Otp
 * @returns {Promise<boolean>} - Success status
 */
const sendEmailTo = async (data) => {
  const {emailTo , actions ,tempPassword , otp} = data
  
  try {
    // Validate emailTo
    if (!emailTo || !isValidEmail(emailTo)) {
      throw new Error("Invalid emailTo address");
    }

    const actionList = Array.isArray(actions) ? actions : [actions];

    
    if (actionList.includes("add_new_user")) {
      console.log("Action 'add_new_user' detected. Sending welcome emailTo...");
      
      const mailOptions = {
        from: `"AMP Portal" <sohayb.akour10@gmail.com>`,
        to: emailTo,
        subject: "🎉 Welcome to AMP - Your Account Details",
        html: generateWelcomeEmailHTML(tempPassword),
        text: generateWelcomeEmailText(tempPassword)
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Welcome emailTo sent successfully to:", emailTo);
      return true;
    }

    // Handle OTP emailTo action
    if (actionList.includes("send_otp")) {
      console.log("Action 'send_otp' detected. Sending OTP emailTo...");
      
      // const otp = tempPassword; // Assuming tempPassword is OTP in this case
      const mailOptions = {
        from: "AMP Portal",
        to: emailTo,
        subject: "🔐 Your OTP Verification Code",
        html: generateOTPEmailHTML(otp),
        text: generateOTPEmailText(otp)
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ OTP emailTo sent successfully to:", emailTo);
      return true;
    }

    // No valid action found
    console.warn("⚠️ No valid action specified");
    return false;

  } catch (error) {
    console.error("❌ Failed to send emailTo:", error.message);
    throw error; // Re-throw to let caller handle the error
  }
};

/**
 * Validate emailTo format
 */
function isValidEmail(emailTo) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailTo);
}

/**
 * Generate Welcome Email HTML
 */
function generateWelcomeEmailHTML(tempPassword) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to AMP</h1>
      </div>
      
      <div style="background: white; padding: 30px; margin-top: -10px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #374151; margin-top: 0;">Your Account Has Been Created!</h2>
        <p style="color: #6b7280; font-size: 16px;">Welcome to the AMP Portal. Your account has been successfully created.</p>
        
        <div style="background: #f3f4f6; border-left: 4px solid #10b981; border-radius: 4px; padding: 20px; margin: 20px 0;">
          <p style="color: #374151; margin: 10px 0;"><strong>📧 Email:</strong> ${tempPassword ? 'Your registered email' : 'Check your profile'}</p>
          ${tempPassword ? `
          <p style="color: #374151; margin: 10px 0;"><strong>🔑 Temporary Password:</strong></p>
          <div style="background: white; border: 2px dashed #10b981; border-radius: 8px; padding: 15px; text-align: center; margin: 10px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #10b981; font-family: monospace;">${tempPassword}</span>
          </div>
          ` : ''}
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://vote-frontend-xi.vercel.app" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Login to Your Account
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          🔒 For security reasons, never share your password with anyone.<br>
          ❓ If you have any questions, please contact our support team.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 5px 0;">© 2025 AMP Portal. All rights reserved.</p>
        <a href="https://vote-frontend-xi.vercel.app" style="color: #10b981; text-decoration: none;">https://vote-frontend-xi.vercel.app/</a>
      </div>
    </div>
  `;
}

/**
 * Generate Welcome Email Plain Text
 */
function generateWelcomeEmailText(tempPassword) {
  return `
Welcome to AMP Portal!

Your account has been successfully created.

${tempPassword ? `Temporary Password: ${tempPassword}` : ''}

⚠️ IMPORTANT: Please change your password after your first login for security purposes.

Login at: https://vote-frontend-xi.vercel.app

🔒 For security reasons, never share your password with anyone.
❓ If you have any questions, please contact our support team.

© 2025 AMP Portal. All rights reserved.
  `.trim();
}

/**
 * Generate OTP Email HTML
 */
function generateOTPEmailHTML(otp) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Verification Code</h1>
      </div>
      
      <div style="background: white; padding: 30px; margin-top: -10px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #374151; margin-top: 0;">Your OTP Code</h2>
        <p style="color: #6b7280; font-size: 16px;">Please use the following verification code to complete your action:</p>
        
        <div style="background: #f3f4f6; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: monospace;">${otp}</span>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
          ⏰ This code will expire in <strong>5 minutes</strong>.<br>
          🔒 For security reasons, never share this code with anyone.<br>
          ❓ If you didn't request this code, please ignore this emailTo.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 5px 0;">© 2025 AMP Portal. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Generate OTP Email Plain Text
 */
function generateOTPEmailText(otp) {
  return `
Your OTP verification code is: ${otp}

⏰ This code will expire in 5 minutes.
🔒 For security reasons, never share this code with anyone.
❓ If you didn't request this code, please ignore this emailTo.

© 2025 AMP Portal. All rights reserved.
  `.trim();
}

// Export the function
module.exports = { sendEmailTo };


