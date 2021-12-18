"use strict";
const fk = require("faker/locale/vi");
const db = require("../models");

async function seedComment(obj) {
  let typeMapper = { Requests: 0, Supports: 1 };
  let idFieldMapper = ["id_request", "id_support"];
  let objectType = typeMapper[obj.constructor.name];
  // console.log({ obj, objectType });
  let members = null;
  if (objectType == 0) {
    members = await (await obj.getGroup()).getMembers();
  } else {
    members = await (await (await obj.getRequest()).getGroup()).getMembers();
  }
  let n = Number.parseInt(Math.random() * members.length);
  let commentData = [];
  while (n > 0) {
    let member = members[Number.parseInt(Math.random() * members.length)];
    let data = {
      username: member.username,
      object_type: objectType,
      content: fk.lorem.sentences(),
      date_created: new Date(),
    };
    data[idFieldMapper[objectType]] = obj[idFieldMapper[objectType]];
    console.log(data);
    commentData.push(data);
    --n;
  }
  return commentData;
}

async function seedObjectArray(objs) {
  let seedings = [];
  for (let i = 0; i < objs.length; ++i) {
    seedings.push(...(await seedComment(objs[i])));
  }
  return seedings;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let requests = await db.Requests.findAll();
    let supports = await db.Supports.findAll();
    let tasks = [];
    tasks.push(
      queryInterface.bulkInsert("Comments", await seedObjectArray(requests))
    );
    tasks.push(
      queryInterface.bulkInsert("Comments", await seedObjectArray(supports))
    );
    return Promise.all(tasks);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Comments", null, {});
  },
};
