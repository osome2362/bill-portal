const jwt = require("jsonwebtoken");

const authentic = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.headers["token"];

    if (!token)
      return res
        .status(401)
        .json({ error: "❌ No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || decoded;
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    return res.status(401).json({ error: "❌ Invalid token" });
  }
};

module.exports = authentic;
