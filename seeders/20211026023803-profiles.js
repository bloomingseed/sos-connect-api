"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let seedings = [];
    let districts = ["Liên Chiểu", "Hải Châu", "Sơn Trà"];
    let wards = ["Hòa Khánh Bắc", "Thanh Bình", "Phước Mỹ"];
    let streets = ["Tôn Đức Thắng", "Ông Ích Khiêm", "Võ Nguyên Giáp"];
    for (let i = 0; i < 20; ++i) {
      let districtIndx = (i + 1) % 10;
      seedings.push({
        username: `seeding.user.${i + 1}`,
        last_name: "Seeding",
        first_name: `User ${i + 1}`,
        gender: (i + 1) % 4 != 0,
        date_of_birth: `2000-01-${i + 1 < 10 ? "0" + (i + 1) : i + 1}`,
        country: "Việt Nam",
        province: "Đà Nẵng",
        district:
          districtIndx < 6
            ? districts[0]
            : districtIndx < 9
            ? districts[1]
            : districts[2],
        ward:
          districtIndx < 6 ? wards[0] : districtIndx < 9 ? wards[1] : wards[2],
        street:
          `${i + 1} ` +
          (districtIndx < 6
            ? streets[0]
            : districtIndx < 9
            ? streets[1]
            : streets[2]),
        is_deactivated: false,
        is_deleted: false,
      });
    }
    seedings.push({
      username: "bloomingseed",
      last_name: "Nguyễn Nhật",
      first_name: "Tùng",
      gender: true,
      date_of_birth: `2000-03-23`,
      country: "Việt Nam",
      province: "Đà Nẵng",
      district: "Liên Chiểu",
      ward: "Hòa Khánh Bắc",
      street: "K81/01 Ngô Thì Nhậm",
      is_deactivated: false,
      is_deleted: false,
    });
    seedings.push({
      username: "nvcgooner",
      last_name: "Nguyễn Văn",
      first_name: "Cường",
      gender: true,
      date_of_birth: `2000-01-01`,
      country: "Việt Nam",
      province: "Đà Nẵng",
      district: "Liên Chiểu",
      ward: "Hòa Khánh Bắc",
      street: "1 Ngô Thì Nhậm",
      is_deactivated: false,
      is_deleted: false,
    });
    return queryInterface.bulkInsert("Profiles", seedings);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Profiles", null, {});
  },
};
