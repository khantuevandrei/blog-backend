function checkUsername(username) {
  // Require username & password
  if (!username) {
    const err = new Error("Username is required");
    err.status = 400;
    throw err;
  }

  // Normalize username
  const normalizedUsername = username.trim().toLowerCase();
  if (normalizedUsername === "") {
    const err = new Error("Username cannot be empty");
    err.status = 400;
    throw err;
  }

  // Require pattern
  const usernameRegex = /^[a-z0-9_]+$/;
  if (!usernameRegex.test(normalizedUsername)) {
    const err = new Error(
      "Username may only contain letters, numbers, or underscores"
    );
    err.status = 400;
    throw err;
  }

  return normalizedUsername;
}

function checkPassword(password, confirmPassword) {
  // Require pattern
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    const err = new Error(
      "Password must be at least 8 characters long and include lowercase, uppercase, number and symbol"
    );
    err.status = 400;
    throw err;
  }

  // Match passwords
  if (password !== confirmPassword) {
    const err = new Error("Passwords do not match");
    err.status = 400;
    throw err;
  }

  return password;
}

module.exports = {
  checkUsername,
  checkPassword,
};
