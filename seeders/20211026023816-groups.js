"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Groups", [
      {
        name: "Hỗ trợ COVID-19 quận Liên Chiểu, Đà Nẵng",
        description:
          "Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Liên Chiểu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group.",
        is_deleted: false,
        date_created: new Date(),
      },
      {
        name: "Hỗ trợ COVID-19 quận Hải Châu, Đà Nẵng",
        description:
          "Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Hải Châu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group.",
        is_deleted: false,
        date_created: new Date(),
      },
      {
        name: "Hỗ trợ lũ lụt hằng năm miền Trung Việt Nam",
        description:
          "Nhóm hỗ trợ người dân chịu ảnh hưởng bởi lũ lụt hằng năm khu vực miền Trung Việt Nam.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group.",
        is_deleted: false,
        date_created: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Groups", null, {});
  },
};
