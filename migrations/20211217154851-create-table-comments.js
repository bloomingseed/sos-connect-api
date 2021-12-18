"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Comments", {
      id_comment: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      id_request: {
        type: Sequelize.INTEGER,
        references: {
          model: "Requests",
          key: "id_request",
        },
      },
      id_support: {
        type: Sequelize.INTEGER,
        references: {
          model: "Supports",
          key: "id_support",
        },
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Profiles",
          key: "username",
        },
      },
      object_type: {
        type: Sequelize.INTEGER,
      },
      content: {
        type: Sequelize.TEXT,
      },
      is_deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      date_created: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Comments");
  },
};
