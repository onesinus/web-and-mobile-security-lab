const express = require("express");
const { query, queryUnsafe } = require("../db");
const { authenticateToken, optionalAuth, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/panel", optionalAuth, async (req, res) => {
  const tickets = await query("SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 50");
  const customers = await query("SELECT id, username, email, role, is_vip, ssn FROM customers");
  res.render("admin", {
    tickets: tickets.rows,
    customers: customers.rows,
    isAdmin: req.user && req.user.role === "admin",
  });
});

// Admin customers search (SQLi)
router.get("/api/customers", optionalAuth, async (req, res) => {
  const { q } = req.query;
  let rows;
  if (q) {
    const r = await queryUnsafe(`SELECT id, username, email, role, ssn FROM customers WHERE username LIKE '%${q}%'`);
    rows = r.rows;
  } else {
    const r = await query("SELECT id, username, email, role, ssn FROM customers");
    rows = r.rows;
  }
  res.json(rows);
});

// Secret flag only reachable by admin
router.get("/api/flag", optionalAuth, adminOnly, (req, res) => {
  res.json({ flag: "FLAG{ADMIN_PANEL_ACCESS_GRANTED}" });
});

module.exports = router;