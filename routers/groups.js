var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

const DUP_KEY_ERRCODE = "23505";
var groupsRouter = express.Router();
var groupUsersRouter = express.Router({ mergeParams: true });
var groupRequestRouter = express.Router({ mergeParams: true });

// feature 6
// uses token auth middleware by default
async function getGroup(groupId, res) {
  if (typeof parseInt(groupId) !== "number") {
    return res.status(400).json({ error: `id_group must be an integer`});
  }
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
async function updateGroupInfoHandler(req, res) {
  if (req.verifyResult.is_admin == false) {
    return res.status(401).json({ error: `User must be admin` });
  }
  let groupId = req.params.id_group;
  let group = await getGroup(groupId, res);
  console.log(req.body);
  for (let key in req.body) {
    console.log(key);
    if (key == "is_deleted") continue; // prevents updating 'is_deleted' field
    if( req.body[key] == null){
      return res.status(400).json({ error: `Data has empty fields`});
    }
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
  if (req.verifyResult.is_admin == false) {
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
  if (req.verifyResult.is_admin == true) {
    return res.status(400).json({ error: `Admin can not join groups` });
  }
  let groupId = req.params.id_group;
  await getGroup(groupId, res);
  let role = req.body.as_role;
  if (role == null) {
    return res
      .status(400)
      .json({ error: `Request body must contain 'as_role' field` });
  }
  let is_admin_invited = req.body.is_admin_invited;
  if (typeof Boolean(role) !== 'boolean'|| (is_admin_invited != null && typeof Boolean(is_admin_invited) !== 'boolean') ) {
    return res.status(400).json({ error: `Data has fields wrong type`});
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
        is_deleted: false,
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
  if (req.verifyResult.is_admin == false) {
    return res.status(401).json({ error: `Only admins can create groups` });
  }
  let group = new db.Groups();
  if (req.body.name == null || req.body.description == null) {
    return res.status(400).json({ error: `Data has empty fields`});
  }
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

//GET /groups/:id_group/requests
async function getListGroupRequestHandler(req, res) {
  try {
    let groupId = req.params.id_group;
    await getGroup(groupId, res);
    let searchParams = {
      search: req.query.search || "",
      field: req.query.field || "id_request",
      sort: req.query.sort || "asc",
    };
    let requests = await db.Requests.findAll({
      where: {
        id_group: groupId,
        content: { [Op.like]: `%${searchParams.search}%` },
        is_deleted: false,
      },
      order: [[searchParams.field, searchParams.sort]],
    });
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

// POST /groups/:id_group/requests
async function createGroupRequestHandler(req, res) {
  req.body.id_group = req.params.id_group;
  if (typeof parseInt(req.body.id_group) !== "nember") {
    return res.status(400).json({ error: `id_group must be an integer`});
  }
  req.body.username = req.verifyResult.username;
  try {
    let member = await db.Members.findOne({
      where: {
        id_group: req.body.id_group,
        username: req.body.username,
      },
    });
    console.log(member);
    if (member == null) {
      return res
        .status(400)
        .json({
          error: `${req.body.username} is not a member of ${req.body.group_id}`,
        });
    }
    if( req.body.content == null ) {
      return res.status(400).json({ error: `content is null` });
    }
    let request = new db.Requests();
    for (let key in req.body) {
      request[key] = req.body[key];
    }
    await request.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

groupsRouter
  .route("/")
  .get(listGroupsHandler)
  .post(authUserMiddleware, createGroupHandler);
groupsRouter
  .route("/:id_group")
  .get(showGroupInfoHandler)
  .put(authUserMiddleware, updateGroupInfoHandler)
  .delete(authUserMiddleware, deleteGroupHandler);
groupUsersRouter
  .route("/")
  .get(listGroupUsersHandler)
  .post(authUserMiddleware, userJoinsGroupHandler);
groupsRouter.use("/:id_group/users", groupUsersRouter); // uses nested router
groupRequestRouter
  .route("/")
  .get(getListGroupRequestHandler)
  .post(authUserMiddleware, createGroupRequestHandler);
groupsRouter.use("/:id_group/requests", groupRequestRouter);

module.exports = { router: groupsRouter, name: "groups" };
