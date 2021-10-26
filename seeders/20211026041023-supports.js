"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let requests = (
      await queryInterface.sequelize.query('SELECT * from "Requests";')
    )[0];
    console.log(requests);
    let seedings = [];
    for (let value of requests) {
      let members = (
        await queryInterface.sequelize.query(
          `select * from "Members" where id_group=${value.id_group} and as_role=true;`
        )
      )[0];
      // console.log(members);
      for (let member of members) {
        seedings.push({
          id_request: value.id_request,
          username: member.username,
          content: "I dont have the items needed but i will send you some $$$",
          date_created: new Date(),
        });
      }
    }
    console.log(seedings.length, seedings);
    return queryInterface.bulkInsert("Supports", seedings);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Supports", null, {});
  },
};
