var express = require("express");
var db = require("../models");
var { authUserMiddleware, getUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

const DUP_KEY_ERRCODE = "23505";
var groupsRouter = express.Router();
var groupUsersRouter = express.Router({ mergeParams: true });

// feature 6
// uses token auth middleware by default
async function getGroup(groupId, res) {
  let group = await db.Groups.findByPk(groupId);
  if (group == null) {
    return res
      .status(400)
      .json({ error: `Group ID ${groupId} does not exist` });
  }
  return group;
}
// GET /groups/:id_group
// no token auth middleware
async function showGroupInfoHandler(req, res) {
  let groupId = req.params.id_group;
  try {
    let group = await getGroup(groupId, res);
    return res.status(200).json(group);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}
// PUT /groups/:id_group
// uses getUserMiddleware
async function updateGroupInfoHandler(req, res) {
  if (req.user.is_admin == false) {
    return res.status(401).json({ error: `User must be admin` });
  }
  let groupId = req.params.id_group;
  let group = await getGroup(groupId, res);
  console.log(req.body);
  for (let key in req.body) {
    console.log(key);
    if (key == "is_deleted") continue; // prevents updating 'is_deleted' field
    group[key] = req.body[key];
  }
  console.log(group);
  try {
    await group.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}
// DELETE /groups/:id_group
async function deleteGroupHandler(req, res) {
  if (req.user.is_admin == false) {
    return res.status(401).json({ error: `User must be admin` });
  }
  let groupId = req.params.id_group;
  let group = await getGroup(groupId, res);
  group.is_deleted = true;
  try {
    group.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}
// POST /groups/:id_group/users: user joins group
async function userJoinsGroupHandler(req, res) {
  if (req.user.is_admin == true) {
    return res.status(400).json({ error: `Admin can not join groups` });
  }
  let groupId = req.params.id_group;
  await getGroup(groupId, res);
  let role = req.body.as_role;
  if (!role) {
    return res
      .status(400)
      .json({ error: `Request body must contain 'as_role' field` });
  }
  try {
    await db.Members.create({
      username: req.verifyResult.username,
      id_group: groupId,
      as_role: role,
      is_admin_invited: req.body.is_admin_invited || false,
    });
    return res.sendStatus(200);
  } catch (e) {
    if (e.parent.code == DUP_KEY_ERRCODE) {
      return res.status(400).json({
        error: `User ${req.verifyResult.username} has already joined group ${groupId}`,
      });
    }
    return res.status(500).json({ error: e });
  }
}
// GET /groups/:id_group/users: show group's users
async function listGroupUsersHandler(req, res) {
  let searchParams = {
    search: req.query.search || "",
    field: req.query.field || "id_group",
    sort: req.query.sort || "asc",
  };
  // console.log(searchParams);
  let groupId = req.params.id_group;
  await getGroup(groupId, res);
  try {
    let groups = await db.Members.findAll({
      where: {
        id_group: groupId,
        username: { [Op.like]: `%${searchParams.search}%` },
      },
      order: [[searchParams.field, searchParams.sort]],
    });
    return res.status(200).json(groups);
  } catch (e) {
    return res.status(500).json({ error: e.parent });
  }
}
// feature 12
// GET /groups
// no token auth middleware
async function listGroupsHandler(req, res) {
  let searchParams = {
    search: req.query.search || "",
    field: req.query.field || "id_group",
    sort: req.query.sort || "asc",
  };
  console.log(searchParams);
  try {
    let groups = await db.Groups.findAll({
      where: {
        name: { [Op.like]: `%${searchParams.search}%` },
      },
      order: [[searchParams.field, searchParams.sort]],
    });
    return res.status(200).json(groups);
  } catch (e) {
    return res.status(500).json({ error: e.parent });
  }
}
// POST /groups
async function createGroupHandler(req, res) {
  if (req.user.is_admin == false) {
    return res.status(401).json({ error: `Only admins can create groups` });
  }
  let group = new db.Groups();
  for (let key in req.body) {
    group[key] = req.body[key];
  }
  try {
    await group.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e.parent });
  }
}

groupsRouter
  .route("/")
  .get(listGroupsHandler)
  .post(authUserMiddleware, getUserMiddleware, createGroupHandler);
groupsRouter
  .route("/:id_group")
  .get(showGroupInfoHandler)
  .put(authUserMiddleware, getUserMiddleware, updateGroupInfoHandler)
  .delete(authUserMiddleware, getUserMiddleware, deleteGroupHandler);
groupUsersRouter
  .route("/")
  .get(listGroupUsersHandler)
  .post(authUserMiddleware, getUserMiddleware, userJoinsGroupHandler);
groupsRouter.use("/:id_group/users", groupUsersRouter); // uses nested router

module.exports = { router: groupsRouter, name: "groups" };
