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
  return result.rows[0] || null;
}

async function getUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE username = $1
  `,
    [username]
  );
  return result.rows[0] || null;
}

async function getUserById(userId) {
  const result = await pool.query(
    `
    SELECT 
      u.id,
      u.username,
      u.role,
      u.created_at,
      (
        SELECT COUNT(*) 
        FROM posts p
        WHERE p.user_id = u.id
      ) AS post_count
    FROM users u
    WHERE u.id = $1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function getUserPostCount(userId) {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS post_count
    FROM posts
    WHERE user_id = $1
    `,
    [userId]
  );

  // Returns number
  return parseInt(result.rows[0].post_count, 10);
}

async function updateUserById(userId, fields) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in fields) {
    fields.push(`${key} = $${idx}`);
    values.push(fields[key]);
    idx++;
  }

  if (fields.length === 0) return null;

  values.push(userId); // for WHERE clause
  const query = `
    UPDATE users
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, username, role, created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function deleteUserById(userId) {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, username, role, created_at
  `,
    [userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  getUserPostCount,
  updateUserById,
  deleteUserById,
};
