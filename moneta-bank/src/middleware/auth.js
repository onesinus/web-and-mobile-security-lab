const jwt = require("jsonwebtoken");
const { pool, JWT_SECRET } = require("../db");

function signToken(customer) {
  return jwt.sign(
    { sub: customer.id, username: customer.username, role: customer.role, vip: customer.is_vip },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const cookieToken = req.cookies && req.cookies.moneta_session;
  const token = (authHeader && authHeader.split(" ")[1]) || cookieToken;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const cookieToken = req.cookies && req.cookies.moneta_session;
  const token = (authHeader && authHeader.split(" ")[1]) || cookieToken;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    req.user = null;
  }
  next();
}

async function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { authenticateToken, optionalAuth, adminOnly, signToken, JWT_SECRET };