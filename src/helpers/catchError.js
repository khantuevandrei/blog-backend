function catchError(handler) {
  return async function (req, res, next) {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error(err);
      const status = err.status || 500;
      const message = err.message || "Server error";
      res.status(status).json({ message });
    }
  };
}

module.exports = catchError;
