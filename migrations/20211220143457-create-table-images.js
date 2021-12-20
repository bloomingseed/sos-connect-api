"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Images", {
      id_image: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      id_request: {
        type: Sequelize.INTEGER,
      },
      id_support: {
        type: Sequelize.INTEGER,
      },
      object_type: {
        type: Sequelize.INTEGER,
      },
      url: {
        type: Sequelize.STRING,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Images");
  },
};
