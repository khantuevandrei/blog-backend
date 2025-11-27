const pool = require("../pool");

async function createUser(username, password_hash) {
  const result = await pool.query(`
    INSERT INTO users (username, password_hash)
    VALUES ($1, $2)
    RETURNING id
  `);
  // Return user id
  return result.rows[0];
}

async function findUserByUsername(username) {}

async function findUserById(id) {}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
};
