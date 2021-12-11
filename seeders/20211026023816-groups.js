"use strict";
const { Groups } = require("../models");
let names = [
  "COVID-19 khu vực quận Liên Chiểu, Đà Nẵng",
  "COVID-19 khu vực quận Hải Châu, Đà Nẵng",
  "lũ lụt hằng năm khu vực miền Trung Việt Nam",
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (let i = 0; i < names.length; ++i) {
      await Groups.create({
        name: `Hỗ trợ ${names[i]}`,
        description: `Nhóm hỗ trợ người dân chịu ảnh hưởng bởi ${names[i]}.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group.`,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Groups", null, {});
  },
};
