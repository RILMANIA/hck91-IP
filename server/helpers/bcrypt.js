const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
};

const comparePassword = (password, hashedPassword) => {
  const isMatch = bcrypt.compareSync(password, hashedPassword);
  return isMatch;
};

module.exports = {
  hashPassword,
  comparePassword,
};
