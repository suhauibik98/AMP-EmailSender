const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];


    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.EMAIL_SERVICE_TOKEN_DECODER);
    // if (decoded.role != "admin") {
    //   return res.status(403).json({ message: "Forbidden: Admins only" });
    // }
    // ✅ لا DB call
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
