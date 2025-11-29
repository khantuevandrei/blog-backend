// Check if id exists and it is numeric
function checkId(id, type = "ID") {
  if (!id) {
    const err = new Error(`${type} is required`);
    err.status = 400;
    throw err;
  }
  if (isNaN(id)) {
    const err = new Error(`Invalid ${type}`);
    err.status = 400;
    throw err;
  }
  return Number(id);
}

// Check if body exists and it is not empty
function checkTextField(textField, name = "Field") {
  if (!textField || !textField.trim()) {
    const err = new Error(`${name} is required`);
    err.status = 400;
    throw err;
  }
  return textField.trim();
}

module.exports = {
  checkId,
  checkTextField,
};
