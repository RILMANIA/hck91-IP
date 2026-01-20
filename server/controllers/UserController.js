const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

module.exports = class UserController {
  static async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const newUser = await User.create({
        email,
        password,
      });

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
      });
    } catch (error) {
      console.log(error, "<<< error in register");
      next(error);
    }
  }

  static async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw {
          name: "LoginError",
          message: "Email is required",
        };
      }

      if (!password) {
        throw {
          name: "LoginError",
          message: "Password is required",
        };
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw {
          name: "LoginError",
          message: "Invalid email or password",
        };
      }

      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw {
          name: "LoginError",
          message: "Invalid email or password",
        };
      }

      const access_token = signToken({ id: user.id });

      res.status(200).json({ access_token });
    } catch (error) {
      console.log(error, "<<< error in loginUser");
      next(error);
    }
  }
};
