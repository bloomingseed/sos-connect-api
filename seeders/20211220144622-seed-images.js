"use strict";
const fk = require("faker/locale/vi");
const db = require("../models");
const MAX = 5; // max image count per object
const customSeedImages = [
  "https://soyte.namdinh.gov.vn/Uploads/2018/11/2/27/image001-(9).jpg",
  "https://cf.shopee.vn/file/9f38d88e6d16e80a50a202f608e72a42",
  "https://bizweb.dktcdn.net/100/169/223/products/z1642210603397-2aa249909812fcd6206bae0ec1cbd265.png?v=1575253116063",
  "https://htvcoop.com.vn/13651-thickbox_default/duong-tinh-luyen-bien-hoa-1kg.jpg",
  "https://hoianuong.vn/hinh-anh-trung-ga-ta/imager_89991.jpg",
  "https://vifon.com.vn/vnt_upload/product/mi/mi-tom-chua-cay_1.png",
  "https://vifon.com.vn/vnt_upload/product/mi/mi-tom-chua-cay-70g.png",
  "https://vifon.com.vn/vnt_upload/product/mi/mi-tom-chua-cay-VIFON.png",
  "https://news.mogi.vn/wp-content/uploads/2019/11/phong-tro-da-nang-anh-bia.jpg",
  "https://viraland.vn/wp-content/uploads/2020/04/Thue-phong-tro-da-nang-theo-nhu-cau.jpg",
  "https://news.mogi.vn/wp-content/uploads/2019/06/tro-da-nang-anh-1.jpg",
  "https://news.mogi.vn/wp-content/uploads/2019/11/phong-tro-da-nang-6.jpg",
  "https://file4.batdongsan.com.vn/crop/350x232/2018/08/07/20180807181855-d70c_wm.jpg",
  "https://file4.batdongsan.com.vn/resize/745x510/2018/10/17/20181017092003-1bdc.jpg",
  "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2018/08/31/ee0a7e95-bb0c-480d-9574-d6ca6adb0e98_1535703340.jpg",
  "https://lh3.googleusercontent.com/proxy/89aug-4_0OF59IpLasCpkngMwm1dqQA8hKS66yLrAjBFBUaccbQC4pxmgM3ScR1eWCjQaW20CCprCI8ax9CcbC2r7W5Ek31N5jXIWIvXyiXq_hRG7BGS5NTW_VNhQF68QHA04aE7hDXDThjt-1GtbhWmlUtf",
  "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2021/04/16/z2437710496907-60d252d551456efe2bbdf3e1fbd0f915_1618553758.jpg",
  "https://cdn.chotot.com/O8MOdQKCMuMuWyfew7RrQzOuYtWpIiV3x9o2YgR7LZs/preset:listing/plain/14a62cd3f2431d38478292ef0fe27d55-2739799888891589575.jpg",
  "http://baoninhbinh.org.vn/DATA/ARTICLES/2020/10/19/ho-tro-nguoi-dan-vuot-qua-kho-khan-va-khac-phuc-hau-qua-11543.jpg",
  "https://static.tapchitaichinh.vn/images/upload/buituananh/05272019/d1830c0782bc9ca9aab4170365c29f81_tr_26-27.jpg",
  "https://vtv1.mediacdn.vn/thumb_w/640/2020/10/8/vnapotalnhieudiaphuongtaitinhquangtribicolapdomualu1232113815055984-16021416986871169347207.jpg",
  "https://vtv1.mediacdn.vn/thumb_w/640/2020/10/9/vnapotalthuathien-huenoluckhacphucsatlotaihuyenaluoi1617350055056697-1602180442418106331875.jpg",
  "https://cdn.thuvienphapluat.vn/tintuc/uploads/image/2020/08/01/benh-nhan-covid-19-tu-vong.jpg",
  "https://kcb.vn/wp-content/uploads/2018/10/44943444_184729672438117_4870443066273562624_n.jpg",
  "https://nld.mediacdn.vn/291774122806476800/2021/8/11/14-hinh-bai-chot-11-16286869449651215833390.jpg",
  "https://images.hcmcpv.org.vn/res/news/2021/08/09-08-2021-quan-7-nhieu-khu-dieu-tri-benh-nhan-covid19-da-duoc-dua-vao-hoat-dong-38F34B97.jpg",
  "https://nld.mediacdn.vn/thumb_w/600/291774122806476800/2021/12/1/14-hinh-bai-chot-16383673521931907736351.jpg",
];
function randomizeImage() {
  return Math.random() < 0.5
    ? customSeedImages[Number.parseInt(Math.random() * customSeedImages.length)]
    : fk.image.image();
}

async function seedImages(obj, imageCount) {
  let typeMapper = { Requests: 0, Supports: 1 };
  let idFieldMapper = ["id_request", "id_support"];
  let objectType = typeMapper[obj.constructor.name];
  // console.log({ obj, objectType });
  let seedData = [];
  for (let i = 0; i < imageCount; ++i) {
    let data = {
      object_type: objectType,
      url: randomizeImage(),
    };
    data[idFieldMapper[objectType]] = obj[idFieldMapper[objectType]];
    seedData.push(data);
  }
  return seedData;
}

async function seedObjectArray(objs) {
  let seedings = [];
  for (let i = 0; i < objs.length; ++i) {
    let imageCount = Number.parseInt(Math.random() * MAX) + 1;
    seedings.push(...(await seedImages(objs[i], imageCount)));
  }
  return seedings;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let requests = await db.Requests.findAll();
    let supports = await db.Supports.findAll();
    let tasks = [];
    tasks.push(
      queryInterface.bulkInsert("Images", await seedObjectArray(requests))
    );
    tasks.push(
      queryInterface.bulkInsert("Images", await seedObjectArray(supports))
    );
    return Promise.all(tasks);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Images", null, {});
  },
};
