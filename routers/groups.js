var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

const DUP_KEY_ERRCODE = "23505";
var groupsRouter = express.Router();
var groupUsersRouter = express.Router({ mergeParams: true });
var groupRequestRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags: 
 *  name: groups
 *  description: Group related APIs
 */

// feature 6
// uses token auth middleware by default
async function getGroup(groupId, res) {
  if (typeof parseInt(groupId) !== "number") {
    return res.status(400).json({ error: `id_group must be an integer`});
  }
  let group = await db.Groups.findByPk(groupId);
  if (group == null) {
    return res
      .status(404)
      .json({ error: `Group ID ${groupId} does not exist` });
  }
  return group;
}

/**
 * @swagger
 * /groups/{id_group}:
 *  get:
 *    summary: Show a group information
 *    tags:
 *      - groups
 *    parameters:
 *      - name: id_group
 *        in: path
 *        require: true
 *        description: The id_group of the group which to get group information
 *        schema:
 *          type: int
 *          example: 1
 *    responses:
 *      200:
 *        description: Return group information
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id_group:
 *                  type: int
 *                description:
 *                  type: string
 *                name:
 *                  type: string
 *                is_deleted:
 *                  type: boolean
 *                date_created:
 *                  type: string
 *              example:
 *                id_group: 1
 *                description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Liên Chiểu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group
 *                name: Hỗ trợ COVID-19 quận Liên Chiểu, Đà Nẵng
 *                is_deleted: true
 *                date_created: 2021-10-29T13:36:14.053Z
 *      404:
 *        description: Group not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Group ID ${id_group} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function showGroupInfoHandler(req, res) {
  let groupId = req.params.id_group;
  try {
    let group = await getGroup(groupId, res);
    return res.status(200).json(group);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

/**
 * @swagger
 * /groups/{id_group}:
 *  put:
 *    summary: Admin updates a group information
 *    tags:
 *      - groups
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_group
 *        in: path
 *        require: true
 *        description: The id_group of the group which to update group information
 *        schema:
 *          type: int
 *          example: 1
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              description:
 *                type: string
 *              name:
 *                type: string
 *            example:
 *              name: Hỗ trợ COVID-19 quận Liên Chiểu, Đà Nẵng
 *              description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Liên Chiểu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group
 *    responses:
 *      200:
 *        description: Group updated
 *      401:
 *        description: Failed to authorize request/ Access token is invalid/ User is not adminUser is not admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request header ‘Authentication’ does not exist or does not contain authentication token."
 *      404:
 *        description: Group not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Group ID ${id_group} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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

/**
 * @swagger
 * /groups/{id_group}:
 *  delete:
 *    summary: Admin deletes a group information
 *    tags:
 *      - groups
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_group
 *        in: path
 *        require: true
 *        description: The id_group of the group which to delete group information
 *        schema:
 *          type: int
 *          example: 1
 *    responses:
 *      200:
 *        description: Group deleted
 *      401:
 *        description: Failed to authorize request/ Access token is invalid/ User is not adminUser is not admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request header ‘Authentication’ does not exist or does not contain authentication token."
 *      404:
 *        description: Group not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Group ID ${id_group} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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

/**
 * @swagger
 * /groups/{id_group}/users:
 *  post:
 *    summary: User joins a group
 *    tags:
 *      - groups
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_group
 *        in: path
 *        require: true
 *        description: The id_group of the group which to join
 *        schema:
 *          type: int
 *          example: 1
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              as_role:
 *                type: boolean
 *              is_admin_invited:
 *                type: boolean
 *            example:
 *              as_role: true
 *              is_admin_invited: false
 *    responses:
 *      200:
 *        description: User joined
 *      400:
 *        description: User is admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "admin can not join groups"
 *      401:
 *        description: Failed to authorize request/ Access token is invalid
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request header ‘Authentication’ does not exist or does not contain authentication token."
 *      404:
 *        description: Group not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Group ID ${id_group} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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

/**
 * @swagger
 * /groups/{id_group}/users:
 *  get:
 *    summary: Show group's users
 *    tags:
 *      - groups
 *    parameters:
 *      - name: id_group
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *      - name: search
 *        in: path
 *        require: true
 *        type: string
 *        example: seeding.user
 *      - name: field
 *        in: path
 *        require: true
 *        type: string
 *        example: username
 *      - name: sort
 *        in: path
 *        require: true
 *        type: string
 *        example: asc
 *    responses:
 *      200:
 *        description: Return group's user
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              item:
 *                type: object
 *                properties:
 *                  username:
 *                    type:string
 *                  id_group:
 *                    type:int
 *                  as_role:
 *                    type: boolean
 *                  is_admin_invited:
 *                    type: boolean
 *                  date_created:
 *                    type: string
 *              example:
 *                - username: seeding.user.3
 *                  id_group: 1
 *                  as_role: false
 *                  is_admin_invited: false
 *                  date_created: 2021-10-29T13:36:30.567Z
 *                - username: seeding.user.6
 *                  id_group: 1
 *                  as_role: true
 *                  is_admin_invited: false
 *                  date_created: 2021-10-29T13:36:30.567Z
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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

/**
 * @swagger
 * /groups:
 *  get:
 *    summary: Show list groups
 *    tags:
 *      - groups
 *    parameters:
 *      - name: search
 *        in: path
 *        require: true
 *        type: string
 *        example: COVID-19
 *      - name: field
 *        in: path
 *        require: true
 *        type: string
 *        example: name
 *      - name: sort
 *        in: path
 *        require: true
 *        type: string
 *        example: asc
 *    responses:
 *      200:
 *        description: Return list groups
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              item:
 *                type: object
 *                properties:
 *                  id_group:
 *                    type:int
 *                  description:
 *                    type: string
 *                  name:
 *                    type: string
 *                  is_deleted:
 *                    type: boolean
 *                  date_created:
 *                    type: string
 *              example:
 *                - id_group: 1
 *                  description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Liên Chiểu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group
 *                  name: Hỗ trợ COVID-19 quận Liên Chiểu, Đà Nẵng
 *                  is_deleted: true
 *                  date_created: 2021-10-29T13:36:14.053Z
 *                - id_group: 2
 *                  description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Hải Châu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group.
 *                  name: Hỗ trợ COVID-19 quận Hải Châu, Đà Nẵng
 *                  is_deleted: false
 *                  date_created: 2021-10-29T13:36:14.053Z
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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

/**
 * @swagger
 * /groups:
 *  post:
 *    summary: admin create a new group
 *    tags:
 *      - groups
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              decription:
 *                type: string
 *            example:
 *              name: Hỗ trợ COVID-19 quận Cẩm Lệ, Đà Nẵng
 *              decription: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Cẩm Lệ, Đà Nẵng.Người gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group.
 *    responses:
 *      200:
 *        description: Created
 *      401:
 *        description: Failed to authorize request/ Access token is invalid/ User is not admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request header ‘Authentication’ does not exist or does not contain authentication token."
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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

/**
 * @swagger
 * /groups/{id_group}/requests:
 *  get:
 *    summary: Show group's requests
 *    tags:
 *      - groups
 *    parameters:
 *      - name: id_group
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *      - name: search
 *        in: path
 *        require: true
 *        type: string
 *        example: COVID-19
 *      - name: field
 *        in: path
 *        require: true
 *        type: string
 *        example: username
 *      - name: sort
 *        in: path
 *        require: true
 *        type: string
 *        example: asc
 *    responses:
 *      200:
 *        description: Return group's requests
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              item:
 *                type: object
 *                properties:
 *                  id_request:
 *                    type:int
 *                  id_group:
 *                    type:int
 *                  username:
 *                    type:string
 *                  content:
 *                    type: string
 *                  is_deleted:
 *                    type: boolean
 *                  date_created:
 *                    type: string
 *                  is_approved:
 *                    type: boolean
 *              example:
 *                - id_request: 2
 *                  id_group: 1
 *                  username: seeding.user.3
 *                  content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. fishes\n2. pumpkin\n3. eggs\n4. rice
 *                  is_deleted: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_approved: false
 *                - id_request: 5
 *                  id_group: 1
 *                  username: seeding.user.9
 *                  content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. cookies\n2. fishes\n3. instant noodles\n4. pumpkin\n5. apples
 *                  is_deleted: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_approved: false
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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

/**
 * @swagger
 * /groups/{id_group}/requests:
 *  post:
 *    summary: create a request
 *    tags:
 *      - groups
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_group
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *            example:
 *              content: cần hổ trợ lương thực, thực phẩm
 *    responses:
 *      200:
 *        description: Created
 *      400:
 *        description: User is not member of group
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "{username} is not member of ${id_group}"
 *      401:
 *        description: Failed to authorize request/ Access token is invalid
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request header ‘Authentication’ does not exist or does not contain authentication token."
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
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
