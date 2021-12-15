"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let seedings = [];
    let groups = (
      await queryInterface.sequelize.query("SELECT id_group from `Groups`;")
    )[0];
    console.log(groups);
    for (let i = 0; i < 20; ++i) {
      seedings.push({
        username: `seeding.user.${i + 1}`,
        id_group: groups[(i + 1) % groups.length].id_group,
        as_role: (i + 1) % 2 == 0,
        is_admin_invited: (i + 1) % 10 == 0,
        date_created: new Date(),
      });
    }
    return queryInterface.bulkInsert("Members", seedings);
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete("Members", null, {});
  },
};
