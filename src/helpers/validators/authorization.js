function checkIfAdminOrSelf(targetUser, requester) {
  if (requester.role !== "admin" && targetUser.id !== requester.id) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
}

function checkIfAuthorized(type, userId) {
  if (type.user_id !== userId) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
}

module.exports = {
  checkIfAdminOrSelf,
  checkIfAuthorized,
};
