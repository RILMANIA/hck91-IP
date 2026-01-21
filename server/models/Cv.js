"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Cv extends Model {
    static associate(models) {
      // define association here
      Cv.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  Cv.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      original_file_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      generated_cv: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Cv",
      tableName: "Cvs",
    },
  );

  return Cv;
};
