const { sendEmailTo } = require("../mainService/emailService");
const Email = require("../models/Email");

const baseSendEmail = async (req, res) => {
  console.log("REQ IP :",req.ip);
  
  try {
    // أرسل الإيميل أولاً
    const emailResult = await sendEmailTo(req.body);
    
    // حاول حفظ السجل بشكل منفصل
    try {
      await Email.create({
        to: req.body.emailTo,
        subject: req.body.actions,
      });
    } catch (dbError) {
      console.error("Failed to save email log, but email was sent:", dbError);
      // لا نريد إعادة خطأ للمستخدم لأن الإيميل تم إرساله بنجاح
    }
    
    // دائماً نرد بنجاح إذا تم إرسال الإيميل
    res.status(201).json({
      message: "Email sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in baseSendEmail:", error);
    res.status(500).json({
      message: "Failed to send email",
      error: error.message,
      success: false,
    });
  }
};

module.exports = { baseSendEmail };
