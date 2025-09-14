// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  //console.log("🔹 Token received:", token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, config.jwt.secret, (err, usertoken) => {
    if (err) {
      //console.log("🔴 Token verification error:", err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token expired' });
      }
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    console.log("✅ Token Verified! User:", usertoken);
    req.user = usertoken;
    next();
  });
};

module.exports = { verifyToken };