const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Always attach decoded user to request
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
