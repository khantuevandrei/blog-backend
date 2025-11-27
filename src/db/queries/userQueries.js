const pool = require("../pool");

async function createUser(username, passwordHash) {
  const result = await pool.query(
    `
    INSERT INTO users (username, password_hash)
    VALUES ($1, $2)
    RETURNING id, username, role, created_at
  `,
    [username, passwordHash]
  );
  return result.rows[0] || null;
}

async function findUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT id, username, password_hash, role, created_at
    FROM users
    WHERE username = $1
    LIMIT 1
  `,
    [username]
  );
  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query(
    `
    SELECT id, username, role, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
};
