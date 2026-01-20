const { verifyToken } = require("../helpers/jwt");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw {
        name: "Unauthorized",
        message: "No authorization token provided",
      };
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.log(error, "<<< error in authentication");
    next(error);
  }
};

module.exports = authenticate;
