"use strict";

/**
 * WHAT: Creates the Cvs table in the database with all required columns
 * INPUT: QueryInterface and Sequelize objects from migration runner
 * OUTPUT: Creates Cvs table with id, userId (FK), original_file_url, generated_cv, timestamps
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cvs", {
      // Primary key - UUID for unique CV identification
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // Cloudinary URL for the original uploaded file
      original_file_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // JSON object containing structured CV data from Gemini
      generated_cv: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      // Foreign key to users table
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // Timestamp when CV record was created
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      // Timestamp when CV record was last updated
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Cvs");
  },
};
