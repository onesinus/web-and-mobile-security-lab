const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "vulnerabledb",
  user: process.env.DB_USER || "student",
  password: process.env.DB_PASSWORD || "student123",
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        credit_card VARCHAR(255),
        ssn VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER,
        price DECIMAL(10,2)
      );
    `);

    const userCount = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (username, email, password, role, credit_card, ssn) VALUES
          ('admin', 'admin@sec-lab.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', '4111-1111-1111-1111', '123-45-6789'),
          ('alice', 'alice@sec-lab.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', '4222-2222-2222-2222', '234-56-7890'),
          ('bob', 'bob@sec-lab.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', '4333-3333-3333-3333', '345-67-8901');

        INSERT INTO products (name, description, price, category) VALUES
          ('Laptop Pro 15"', 'High-performance laptop for professionals', 1499.99, 'Electronics'),
          ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 'Electronics'),
          ('Security Scanner v3', 'Network vulnerability scanner', 499.99, 'Software'),
          ('Admin Dashboard', 'Internal admin panel template', 0.00, 'Software'),
          ('Smart Watch', 'Fitness tracking smart watch', 199.99, 'Electronics'),
          ('USB Security Key', 'Hardware 2FA token', 49.99, 'Accessories');

        INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
          (1, 2, 5, 'Excellent laptop, highly recommend'),
          (1, 3, 4, 'Good but battery could be better'),
          (2, 2, 3, 'Works fine, nothing special');
      `);
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

module.exports = { pool, initDB, query, queryUnsafe };
