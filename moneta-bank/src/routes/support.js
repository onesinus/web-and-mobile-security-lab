const express = require("express");
const { query } = require("../db");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Stored XSS: admin panel renders message with <%- %>
router.post("/api/tickets", optionalAuth, async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "subject and message required" });
  }
  const result = await query(
    "INSERT INTO support_tickets (customer_id, subject, message) VALUES ($1, $2, $3) RETURNING id",
    [req.user ? req.user.sub : 1, subject, message]
  );
  res.json({ id: result.rows[0].id, message: "Ticket submitted" });
});

router.get("/api/tickets", optionalAuth, async (req, res) => {
  const result = await query("SELECT * FROM support_tickets WHERE customer_id = $1", [req.user ? req.user.sub : 0]);
  res.json(result.rows);
});

// Unauthenticated "status check" endpoint that reflects any ticket id
router.get("/api/tickets/:id", optionalAuth, async (req, res) => {
  const result = await query("SELECT * FROM support_tickets WHERE id = $1", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Ticket not found" });
  res.json(result.rows[0]);
});

module.exports = router;