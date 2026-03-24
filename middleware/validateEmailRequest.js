module.exports = (req, res, next) => {
  const { emailTo, actions } = req.body;

  if (!emailTo || !actions) {
    return res.status(400).json({
      message: "emailTo and actions are required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailTo)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  next();
};