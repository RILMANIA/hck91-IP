const { Cv } = require("../models");

async function matchUser(req, res, next) {
  try {
    const { id } = req.params;

    const cvFound = await Cv.findByPk(id);

    if (!cvFound) {
      throw { name: "NotFound", message: "CV not found" };
    }

    if (req.user.id === cvFound.userId) {
      next();
    } else {
      throw { name: "Forbidden", message: "Access denied" };
    }
  } catch (error) {
    console.log(error, "<<<<< error in authorisation middleware");
    next(error);
  }
}

module.exports = matchUser;
