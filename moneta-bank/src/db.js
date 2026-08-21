const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "monetadb",
  user: process.env.DB_USER || "student",
  password: process.env.DB_PASSWORD || "student123",
});

const JWT_SECRET = process.env.JWT_SECRET || "moneta-super-secret-2024";

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        is_vip BOOLEAN DEFAULT FALSE,
        ssn VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        account_number VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(50) DEFAULT 'checking',
        balance DECIMAL(14,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        from_account INTEGER NOT NULL REFERENCES accounts(id),
        to_account INTEGER REFERENCES accounts(id),
        amount DECIMAL(14,2) NOT NULL,
        memo VARCHAR(255),
        approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const count = await client.query("SELECT COUNT(*) FROM customers");
    if (parseInt(count.rows[0].count) === 0) {
      const adminHash = await bcrypt.hash("Admin@123", 10);
      const aliceHash = await bcrypt.hash("Alice@123", 10);
      const bobHash = await bcrypt.hash("Bob@123", 10);

      const admin = await client.query(
        `INSERT INTO customers (username, email, password, role, is_vip, ssn, address) VALUES
          ('admin', 'admin@moneta.bank', $1, 'admin', TRUE, 'FLAG{ADMIN_SSN_LEAKED}', '1 Vault Row'),
          ('alice', 'alice@moneta.bank', $2, 'customer', TRUE, '987-65-4321', '10 Oak Ave'),
          ('bob', 'bob@moneta.bank', $3, 'customer', FALSE, '111-22-3333', '20 Pine St')
        RETURNING id, username`,
        [adminHash, aliceHash, bobHash]
      );

      const byName = admin.rows;

      const accounts = await client.query(
        `INSERT INTO accounts (customer_id, account_number, type, balance) VALUES
          ($1, 'MB-1000-0001', 'savings', 9999999999.99),
          ($2, 'MB-1000-0002', 'checking', 12500.00),
          ($3, 'MB-1000-0003', 'checking', 420.50)
        RETURNING id, account_number`,
        [byName.find((u) => u.username === "admin").id, byName.find((u) => u.username === "alice").id, byName.find((u) => u.username === "bob").id]
      );

      const acct = accounts.rows;

      await client.query(
        `INSERT INTO transactions (from_account, to_account, amount, memo) VALUES
          ($1, $2, 500.00, 'Initial transfer ALICE-START'),
          ($2, $3, 25.50, 'Coffee refund'),
          ($1, $2, 999999.99, 'Internal audit reconciliation')`,
        [acct[0].id, acct[1].id, acct[2].id]
      );
    }
  } finally {
    client.release();
  }
}

function query(text, params) {
  return pool.query(text, params);
}

async function queryUnsafe(text) {
  return pool.query(text);
}

module.exports = { pool, initDB, query, queryUnsafe, JWT_SECRET };