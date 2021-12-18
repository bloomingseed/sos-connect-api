"use strict";
const fk = require("faker/locale/vi");
const db = require("../models");

async function seedReaction(obj) {
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
  let reactionData = [];
  while (n > 0) {
    let member = members[Number.parseInt(Math.random() * members.length)];
    let data = {
      username: member.username,
      object_type: objectType,
    };
    data[idFieldMapper[objectType]] = obj[idFieldMapper[objectType]];
    console.log(data);
    reactionData.push(data);
    --n;
  }
  return reactionData;
}

async function seedObjectArray(objs) {
  let seedings = [];
  for (let i = 0; i < objs.length; ++i) {
    seedings.push(...(await seedReaction(objs[i])));
  }
  return seedings;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let requests = await db.Requests.findAll();
    let supports = await db.Supports.findAll();
    let tasks = [];
    tasks.push(
      queryInterface.bulkInsert("Reactions", await seedObjectArray(requests))
    );
    tasks.push(
      queryInterface.bulkInsert("Reactions", await seedObjectArray(supports))
    );
    return Promise.all(tasks);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Reactions", null, {});
  },
};
