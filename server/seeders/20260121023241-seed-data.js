"use strict";
const { hashPassword } = require("../helpers/bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const users = [
      {
        email: "user1@example.com",
        password: hashPassword("password1"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user2@example.com",
        password: hashPassword("password2"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users, {});

    const cvs = [
      {
        userId: 1, // Demo user ID
        original_file_url: "https://res.cloudinary.com/demo/sample.pdf",
        generated_cv: JSON.stringify({
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
              description: "Developed web applications using React and Node.js",
            },
          ],
          skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"],
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Cvs", cvs, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Cvs", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
