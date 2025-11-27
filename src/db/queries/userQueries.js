const pool = require("../pool");

async function createUser(username, password_hash) {
  const result = await pool.query(
    `
    INSERT INTO users (username, password_hash)
    VALUES ($1, $2)
    RETURNING id, username, role, created_at
  `,
    [username, password_hash]
  );
  return result.rows[0];
}

async function findUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT * FROM users
    WHERE username = $1
    LIMIT 1
  `,
    [username]
  );
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query(
    `
    SELECT * FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
};
