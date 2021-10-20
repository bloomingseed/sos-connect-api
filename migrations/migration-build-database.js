'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Profiles', {
      username: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      last_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      first_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      gender: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      avatar_url: {
        allowNull: false,
        type: Sequelize.STRING
      },
      date_of_birth: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      country: {
        allowNull: false,
        type: Sequelize.STRING
      },
      province: {
        allowNull: false,
        type: Sequelize.STRING
      },
      district: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ward: {
        allowNull: false,
        type: Sequelize.STRING
      },
      street: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phone_number: {
        allowNull: false,
        type: Sequelize.STRING
      },
      is_admin: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      is_deactivated: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      is_deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
    });

    await queryInterface.createTable('Groups', {
      id_group: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      is_deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      date_created: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Requests', {
      id_request: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      id_group: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Groups',
          key: 'id_group'
        }
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING
      },
      content: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      is_deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      date_created: {
        allowNull: false,
        type: Sequelize.DATE
      },
      is_approved: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      }
    });

    await queryInterface.createTable('Supports',{
      id_support: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      id_request: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Requests',
          key: 'id_request'
        }
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING
      },
      content: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      date_created: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Members', {
      username: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true
      },
      id_group: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references:{
          model: 'Groups',
          key: 'id_group'
        }
      },
      as_role: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      is_admin_invited:{
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      date_created: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Accounts');
    await queryInterface.dropTable('Groups');
    await queryInterface.dropTable('Requests');
    await queryInterface.dropTable('Supports');
    await queryInterface.dropTable('Members');
  }
};