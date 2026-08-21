const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { query, JWT_SECRET } = require("../db");
const { signToken } = require("../middleware/auth");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await query(
      "INSERT INTO customers (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role",
      [username, email, hash]
    );
    const customer = result.rows[0];
    const acct = await query(
      "INSERT INTO accounts (customer_id, account_number, type, balance) VALUES ($1, $2, 'checking', 1000.00) RETURNING id, account_number, balance",
      [customer.id, "MB-" + Math.floor(1000 + Math.random() * 9000) + "-" + String(customer.id).padStart(4, "0")]
    );
    const token = signToken({ ...customer, is_vip: false });
    res.cookie("moneta_session", token, { httpOnly: true, sameSite: "Lax" });
    res.json({ token, customer, account: acct.rows[0] });
  } catch (e) {
    res.status(400).json({ error: "Username or email already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await query("SELECT * FROM customers WHERE username = $1", [username]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const customer = result.rows[0];
  const ok = await bcrypt.compare(password, customer.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signToken(customer);
  res.cookie("moneta_session", token, { httpOnly: true, sameSite: "Lax" });
  res.json({ token, customer: { id: customer.id, username: customer.username, email: customer.email, role: customer.role } });
});

// Intentionally leaked debug endpoint (security misconfiguration)
router.get("/debug", (req, res) => {
  res.json({
    bank: "Moneta Bank",
    build: process.env.APP_VERSION || "1.0.0",
    jwt_secret: JWT_SECRET,
    database: {
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
    },
    flags: {
      command_injection: "look for /flag.txt",
    },
  });
});

// Predictable password reset (broken authentication)
router.post("/reset-password", async (req, res) => {
  const { username, secret } = req.body;
  const result = await query("SELECT * FROM customers WHERE username = $1", [username]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  const customer = result.rows[0];
  const expected = crypto.createHash("md5").update(customer.ssn).digest("hex").slice(0, 8);
  if (secret !== expected) {
    return res.status(401).json({ error: "Wrong secret" });
  }
  const newPassword = "Reset-" + Math.floor(Math.random() * 99999);
  const hash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE customers SET password = $1 WHERE id = $2", [hash, customer.id]);
  res.json({ message: "Password reset", temporaryPassword: newPassword });
});

module.exports = router;