const { sendEmailTo } = require("../mainService/emailService");
const Email = require("../models/Email");

const baseSendEmail = async (req, res) => {
  try {
    await sendEmailTo(req.body);
    // await sendEmailTo(
    //   req.body.emailTo,
    //   req.body.actions,
    //   req.body.tempPassword
    // );

    await Email.create({
      to: req.body.emailTo,
      subject: req.body.actions,
    });

    res
      .status(201)
      .json({
        message: "Email sent successfully",
        success: true,
      });
  } catch (error) {
    console.error("Error in baseSendEmail:", error);
    res.status(500).send("Failed to baseSendEmail send email", error.message);
  }
};

module.exports = { baseSendEmail };
