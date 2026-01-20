"use strict";

const { v4: uuidv4 } = require("uuid");

/**
 * WHAT: Seeds the database with sample CV data for testing
 * INPUT: QueryInterface and Sequelize objects from seeder runner
 * OUTPUT: Inserts one demo CV record into Cvs table
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert demo CV data
    await queryInterface.bulkInsert(
      "Cvs",
      [
        {
          id: uuidv4(),
          user_id: uuidv4(), // Demo user ID
          original_file_url: "https://res.cloudinary.com/demo/sample.pdf",
          generated_cv: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            education: [
              {
                institution: "University of Technology",
                degree: "Bachelor of Computer Science",
                year: "2018-2022",
              },
            ],
            experience: [
              {
                company: "Tech Corp",
                position: "Software Developer",
                duration: "2022-Present",
                description:
                  "Developed web applications using React and Node.js",
              },
            ],
            skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Cvs", null, {});
  },
};
