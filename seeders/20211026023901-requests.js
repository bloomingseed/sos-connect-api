"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let members = (
      await queryInterface.sequelize.query("SELECT * from `Members`;")
    )[0];
    console.log(members);
    let seedings = [];
    let items = [
      "rice",
      "apples",
      "milk",
      "eggs",
      "instant noodles",
      "cookies",
      "salt",
      "fishes",
      "pumpkin",
    ];
    let countConfig = { min: 2, max: items.length };
    for (let key in members) {
      let value = members[key];
      if (value.as_role == true) continue;
      let itemsCount = Number.parseInt(
        Math.random() * (countConfig.max - countConfig.min) + countConfig.min
      );
      let _items = Array.from(items);
      let needings = [];
      for (let i = 0; i < itemsCount; ++i) {
        let indx = Number.parseInt(Math.random() * _items.length);
        needings.push(`${i + 1}. ${_items[indx]}`);
        _items.splice(indx, 1);
      }
      seedings.push({
        id_group: value.id_group,
        username: value.username,
        content: `COVID-19 impacts our lives heavily. We are in needed of these items:
        ${needings.join("\n")}`,
        is_deleted: false,
        date_created: new Date(),
        is_approved: key % 5 == 0,
      });
    }
    return queryInterface.bulkInsert("Requests", seedings);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Requests", null, {});
  },
};
