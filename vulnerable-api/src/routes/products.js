const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";

    if (category) {
      sql += " AND category = '" + category + "'";
    }
    if (minPrice) {
      sql += " AND price >= " + minPrice;
    }
    if (maxPrice) {
      sql += " AND price <= " + maxPrice;
    }

    const result = await db.queryUnsafe(sql);
    res.json({ products: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    const result = await db.queryUnsafe(
      "SELECT * FROM products WHERE name LIKE '%" + q + "%' OR description LIKE '%" + q + "%'"
    );

    res.json({ results: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/reviews", authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const result = await db.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.id, req.user.id, rating || 5, comment]
    );

    res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC",
      [req.params.id]
    );

    res.json({ reviews: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/order", authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    const product = await db.query("SELECT * FROM products WHERE id = $1", [product_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const total = parseFloat(product.rows[0].price) * (quantity || 1);

    const order = await db.query(
      "INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *",
      [req.user.id, total]
    );

    await db.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
      [order.rows[0].id, product_id, quantity || 1, product.rows[0].price]
    );

    res.status(201).json({ order: order.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/debug/env", (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
  });
});

module.exports = router;
