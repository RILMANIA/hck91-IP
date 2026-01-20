function errorHandler(err, req, res, next) {
  console.log(err, "<<< error handler");

  switch (err.name) {
    case "SequelizeValidationError":
      res.status(400).json({ message: err.errors[0].message });
      break;
    case "SequelizeUniqueConstraintError":
      res.status(400).json({ message: err.errors[0].message });
      break;
    case "BadRequest":
      res.status(400).json({ message: err.message });
      break;
    case "LoginError":
      res.status(401).json({ message: err.message });
      break;
    case "JsonWebTokenError":
      res.status(401).json({ message: "Invalid token" });
      break;
    case "NotFound":
      res.status(404).json({ message: err.message });
      break;
    case "Forbidden":
      res.status(403).json({ message: err.message });
      break;
    case "Unauthorized":
      res.status(401).json({ message: err.message });
      break;
    default:
      res.status(500).json({ message: "Internal server error" });
      break;
  }
}
module.exports = errorHandler;
