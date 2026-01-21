const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw {
        name: "Unauthorized",
        message: "Invalid token",
      };
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw { name: "LoginError", message: "Invalid token" };
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error, "<<< error in authentication");
    next(error);
  }
};

module.exports = authenticate;
