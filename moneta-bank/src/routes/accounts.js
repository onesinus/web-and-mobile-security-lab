const express = require("express");
const { query, queryUnsafe } = require("../db");
const { authenticateToken, optionalAuth, adminOnly } = require("../middleware/auth");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

async function getAccountsFor(customerId) {
  return query("SELECT * FROM accounts WHERE customer_id = $1", [customerId]);
}

router.get("/accounts", authenticateToken, async (req, res) => {
  const result = await getAccountsFor(req.user.sub);
  res.json(result.rows);
});

// IDOR: statement accessible with any account number
router.get("/accounts/:accountNumber/statement", optionalAuth, async (req, res) => {
  const { accountNumber } = req.params;
  const result = await query("SELECT * FROM accounts WHERE account_number = $1", [accountNumber]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Account not found" });
  }
  const account = result.rows[0];
  const tx = await query(
    "SELECT * FROM transactions WHERE from_account = $1 OR to_account = $1 ORDER BY created_at DESC LIMIT 50",
    [account.id]
  );
  res.json({ account, transactions: tx.rows });
});

// Search with obvious SQLi (UNION-based)
router.get("/transactions/search", authenticateToken, async (req, res) => {
  const { q } = req.query;
  const userAccts = await getAccountsFor(req.user.sub);
  const ids = userAccts.rows.map((a) => a.id).join(", ");
  const result = await queryUnsafe(
    `SELECT id, amount, memo FROM transactions WHERE (from_account IN (${ids}) OR to_account IN (${ids})) AND memo LIKE '%${q}%'`
  );
  res.json(result.rows);
});

// Business logic: negative transfer = free money; no CSRF token check
router.post("/transfer", optionalAuth, async (req, res) => {
  const { to, amount, memo } = req.body;
  if (!to || amount === undefined) {
    return res.status(400).json({ error: "to and amount required" });
  }
  const fromAcct = await query("SELECT * FROM accounts WHERE customer_id = $1 LIMIT 1", [
    req.user ? req.user.sub : 0,
  ]);
  if (fromAcct.rows.length === 0) {
    return res.status(401).json({ error: "No account for current user" });
  }
  if (!/^\d+$/.test(to)) {
    return res.status(400).json({ error: "Invalid destination" });
  }
  const dest = await query("SELECT * FROM accounts WHERE id = $1", [parseInt(to, 10)]);
  if (dest.rows.length === 0) {
    return res.status(404).json({ error: "Destination account not found" });
  }
  const from = fromAcct.rows[0];
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  const client = await require("../db").pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [numericAmount, from.id]);
    await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [numericAmount, dest.rows[0].id]);
    await client.query(
      "INSERT INTO transactions (from_account, to_account, amount, memo) VALUES ($1, $2, $3, $4)",
      [from.id, dest.rows[0].id, numericAmount, memo || ""]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
  res.json({ ok: true });
});

// Mass assignment: profile update trusts client-controlled fields
router.put("/profile", authenticateToken, async (req, res) => {
  const fields = req.body;
  const allowed = {};
  for (const key of ["email", "ssn", "address"]) {
    if (fields[key] !== undefined) allowed[key] = fields[key];
  }
  // Mass assignment bug: role & is_vip copied from request body
  if (fields.role !== undefined) allowed.role = fields.role;
  if (fields.is_vip !== undefined) allowed.is_vip = fields.is_vip;

  const setClause = Object.keys(allowed)
    .map((k, i) => `${k} = $${i + 1}`)
    .join(", ");
  const values = [...Object.values(allowed), req.user.sub];
  await query(`UPDATE customers SET ${setClause} WHERE id = $${values.length}`, values);
  const updated = await query("SELECT id, username, email, role, is_vip FROM customers WHERE id = $1", [req.user.sub]);
  res.json(updated.rows[0]);
});

// SSRF: "verify" a bank via user-supplied URL
router.post("/verify-bank", authenticateToken, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: "Must start with http(s)://" });
  }
  try {
    const axios = require("axios");
    const resp = await axios.get(url, { timeout: 5000, maxRedirects: 0 });
    res.json({ url, status: resp.status, body: String(resp.data).slice(0, 2000) });
  } catch (e) {
    res.status(502).json({ error: "Upstream request failed", detail: e.message, url });
  }
});

// Command injection via csv export filename
router.get("/export", authenticateToken, async (req, res) => {
  const { account } = req.query;
  const filename = `statement_${account}.csv`;
  const csv = spawn("sh", ["-c", `echo "amount,memo" > /tmp/${filename}; echo "LEGIT" >> /tmp/${filename}`]);
  csv.on("error", (e) => res.status(500).json({ error: e.message }));
  csv.stdout.on("data", (d) => {});
  csv.stderr.on("data", (d) => {});
  csv.on("close", (code) => {
    res.json({ filename: `${filename}`, note: "written to /tmp" });
  });
});

// Path traversal on statement download
router.get("/download", optionalAuth, async (req, res) => {
  const { file } = req.query;
  if (!file) return res.status(400).json({ error: "file param required" });
  const fs = require("fs");
  const base = path.join(__dirname, "..", "..", "exports");
  fs.readFile(path.join(base, file), (err, data) => {
    if (err) return res.status(404).json({ error: "File not found" });
    res.setHeader("Content-Type", "text/plain");
    res.send(data);
  });
});

module.exports = router;