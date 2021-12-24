var express = require("express");
var db = require("../models");
var {
  authUserMiddleware,
  validateImagesParamMiddleware,
  pagination,
} = require("../helpers");
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
  if (isNaN(parseInt(groupId))) {
    return res.status(400).json({ error: `id_group must be an integer` });
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
 *                address:
 *                  type: string
 *                name:
 *                  type: string
 *                thumbnail_image_url:
 *                  type: string
 *                cover_image_url:
 *                  type: string
 *                is_deleted:
 *                  type: boolean
 *                date_created:
 *                  type: string
 *                total_members:
 *                  type: int
 *              example:
 *                id_group: 1
 *                description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Liên Chiểu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group
 *                address: Liên Chiểu, Đà Nẵng
 *                name: Hỗ trợ COVID-19 quận Liên Chiểu, Đà Nẵng
 *                thumbnail_image_url: http://api.sos-connect.asia/uploads/g1-thumbnail.png
 *                cover_image_url: http://api.sos-connect.asia/uploads/g1-cover.png
 *                is_deleted: true
 *                date_created: 2021-10-29T13:36:14.053Z
 *                total_members: 2
 *      400:
 *        description: Group ID is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "id_group must be an integer"
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
    group.dataValues.total_members = await db.Members.count({
      where: {
        id_group: groupId,
      },
    });
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
 *              address:
 *                type: string
 *              name:
 *                type: string
 *              thumbnail_image_url:
 *                type: string
 *              cover_image_url:
 *                type: string
 *            example:
 *              address: Liên Chiểu, Đà Nẵng
 *              name: Hỗ trợ COVID-19 quận Liên Chiểu, Đà Nẵng
 *              thumbnail_image_url: http://api.sos-connect.asia/uploads/g1-thumbnail.png
 *              cover_image_url: http://api.sos-connect.asia/uploads/g1-cover.png
 *              description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Liên Chiểu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group
 *    responses:
 *      200:
 *        description: Group updated
 *      400:
 *        description: Group ID is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "id_group must be an integer"
 *      401:
 *        description: User is not admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User must be admin"
 *      403:
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
async function updateGroupInfoHandler(req, res) {
  if (req.verifyResult.is_admin == false) {
    return res.status(401).json({ error: `User must be admin` });
  }
  let groupId = req.params.id_group;
  let group = await getGroup(groupId, res);
  for (let key in req.body) {
    if (key == "is_deleted") continue; // prevents updating 'is_deleted' field
    if (req.body[key] == null) {
      return res.status(400).json({ error: `Data has empty fields` });
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
 *      400:
 *        description: Group ID is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "id_group must be an integer"
 *      401:
 *        description: User is not admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User must be admin"
 *      403:
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
 *      201:
 *        description: User joined
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type:string
 *                id_group:
 *                  type:int
 *                as_role:
 *                  type: boolean
 *                is_admin_invited:
 *                  type: boolean
 *                date_created:
 *                  type: string
 *              example:
 *                username: seeding.user.3
 *                id_group: 1
 *                as_role: false
 *                is_admin_invited: false
 *                date_created: 2021-10-29T13:36:30.567Z
 *      400:
 *        description: User is admin/ Group ID is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "admin can not join groups"
 *      403:
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
  try {
    await db.Members.create({
      username: req.verifyResult.username,
      id_group: groupId,
      as_role: role,
      is_admin_invited: req.body.is_admin_invited || false,
    });
    member = await db.Members.findOne({
      where: {
        id_group: groupId,
        username: req.verifyResult.username,
      },
    });
    return res.status(201).json(member);
  } catch (e) {
    if (e.parent.code == DUP_KEY_ERRCODE || e.parent.code == "ER_DUP_ENTRY") {
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
 *        in: query
 *        require: true
 *        type: string
 *        example: seeding.user
 *      - name: field
 *        in: query
 *        require: true
 *        type: string
 *        example: username
 *      - name: sort
 *        in: query
 *        require: true
 *        type: string
 *        example: asc
 *      - name: page
 *        in: query
 *        require: true
 *        type: int
 *        example: 1
 *    responses:
 *      200:
 *        description: Return group's user
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                current_page:
 *                  type: int
 *                  example: 1
 *                total_pages:
 *                  type: int
 *                  example: 1
 *                total_members:
 *                  type: int
 *                  example: 2
 *                members:
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                    id_group:
 *                      type: int
 *                    as_role:
 *                      type: boolean
 *                    is_admin_invited:
 *                      type: boolean
 *                    date_created:
 *                      type: string
 *                    profile:
 *                      type: object
 *                      properties:
 *                        username:
 *                          type: string
 *                        last_name:
 *                          type: string
 *                        first_name:
 *                          type: string
 *                        gender:
 *                          type: boolean
 *                        avatar_url:
 *                          type: string
 *                        date_of_birth:
 *                          type: string
 *                        country:
 *                          type: string
 *                        province:
 *                          type: string
 *                        district:
 *                          type: string
 *                        ward:
 *                          type: string
 *                        street:
 *                          type: string
 *                        email:
 *                          type: string
 *                        phone_number:
 *                          type: string
 *                        is_deactivated:
 *                          type: boolean
 *                        is_deleted:
 *                          type: boolean
 *                  example:
 *                    - username: seeding.user.3
 *                      id_group: 1
 *                      as_role: false
 *                      is_admin_invited: false
 *                      date_created: 2021-10-29T13:36:30.567Z
 *                      profile:
 *                        username: seeding.user.3
 *                        last_name: Nguyễn Văn
 *                        first_name: Cường
 *                        gender: true
 *                        avatar_url: http://api.sos-connect.asia/uploads/seeding.user.3.png
 *                        date_of_birth: 2000-07-23
 *                        country: Việt Nam
 *                        province: Đà Nẵng
 *                        district: Liên Chiểu
 *                        ward: Hòa Khánh Bắc
 *                        street: 1 Ngô Thì Nhậm
 *                        email: "nvc@mail"
 *                        phone_number: 0132456789
 *                        is_deactivated: false
 *                        is_deleted: false
 *                    - username: seeding.user.6
 *                      id_group: 1
 *                      as_role: true
 *                      is_admin_invited: false
 *                      date_created: 2021-10-29T13:36:30.567Z
 *                      profile:
 *                        username: seeding.user.6
 *                        last_name: Nguyễn Văn
 *                        first_name: Cường
 *                        gender: true
 *                        avatar_url: http://api.sos-connect.asia/uploads/seeding.user.6.png
 *                        date_of_birth: 2000-07-23
 *                        country: Việt Nam
 *                        province: Đà Nẵng
 *                        district: Liên Chiểu
 *                        ward: Hòa Khánh Bắc
 *                        street: 1 Ngô Thì Nhậm
 *                        email: "nvc@mail"
 *                        phone_number: 0132456789
 *                        is_deactivated: false
 *                        is_deleted: false
 *
 *      400:
 *        description: Group ID is not integer/ page is not integer/ page is less than 0/ page is larger total page
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "id_group must be an integer"
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
    field: req.query.field || "date_created",
    sort: req.query.sort || "desc",
  };
  let groupId = req.params.id_group;
  await getGroup(groupId, res);
  const page = req.query.page;
  try {
    if (page == null) {
      let groups = await db.Members.findAll({
        include: {
          model: db.Profiles,
          as: "profile",
        },
        where: {
          id_group: groupId,
          username: { [Op.like]: `%${searchParams.search}%` },
        },
        order: [[searchParams.field, searchParams.sort]],
      });
      return res.status(200).json(groups);
    }
    total_members = await db.Members.count({
      where: {
        id_group: groupId,
        username: { [Op.like]: `%${searchParams.search}%` },
      },
    });
    const { limit, offset, totalPages } = await pagination(
      total_members,
      page,
      res
    );
    let members = await db.Members.findAll({
      include: {
        model: db.Profiles,
        as: "profile",
      },
      where: {
        id_group: groupId,
        username: { [Op.like]: `%${searchParams.search}%` },
      },
      limit: limit,
      offset: offset,
      order: [[searchParams.field, searchParams.sort]],
    });
    return res.status(200).json({
      current_page: page,
      total_pages: totalPages,
      total_members: total_members,
      members: members,
    });
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
 *        in: query
 *        require: true
 *        type: string
 *        example: COVID-19
 *      - name: field
 *        in: query
 *        require: true
 *        type: string
 *        example: name
 *      - name: sort
 *        in: query
 *        require: true
 *        type: string
 *        example: asc
 *      - name: page
 *        in: query
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      200:
 *        description: Return list groups
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                current_page:
 *                  type: int
 *                  example: 1
 *                total_pages:
 *                  type: int
 *                  example: 1
 *                total_groups:
 *                  type: int
 *                  example: 2
 *                groups:
 *                  type: object
 *                  properties:
 *                    id_group:
 *                      type:int
 *                    description:
 *                      type: string
 *                    name:
 *                      type: string
 *                    is_deleted:
 *                      type: boolean
 *                    date_created:
 *                      type: string
 *                  example:
 *                    - id_group: 1
 *                      description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Liên Chiểu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group
 *                      name: Hỗ trợ COVID-19 quận Liên Chiểu, Đà Nẵng
 *                      is_deleted: true
 *                      date_created: 2021-10-29T13:36:14.053Z
 *                    - id_group: 2
 *                      description: Nhóm hỗ trợ người dân chịu ảnh hưởng bởi COVID-19 khu vực quận Hải Châu, Đà Nẵng.\nNgười gặp khó khăn có thể gửi yêu cầu hỗ trợ, người có khả năng có thể gửi hỗ trợ cho các yêu cầu trong group.
 *                      name: Hỗ trợ COVID-19 quận Hải Châu, Đà Nẵng
 *                      is_deleted: false
 *                      date_created: 2021-10-29T13:36:14.053Z
 *      400:
 *        description: page is not integer/ page is less than 0/ page is larger total page
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Page must be an integer"
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
    field: req.query.field || "date_created",
    sort: req.query.sort || "desc",
  };
  const page = req.query.page;
  try {
    if (page == null) {
      let groups = await db.Groups.findAll({
        where: {
          name: { [Op.like]: `%${searchParams.search}%` },
          is_deleted: false,
        },
        order: [[searchParams.field, searchParams.sort]],
      });
      return res.status(200).json(groups);
    }
    total_groups = await db.Groups.count({
      where: {
        name: { [Op.like]: `%${searchParams.search}%` },
        is_deleted: false,
      },
    });
    const { limit, offset, totalPages } = await pagination(
      total_groups,
      page,
      res
    );
    let groups = await db.Groups.findAll({
      where: {
        name: { [Op.like]: `%${searchParams.search}%` },
        is_deleted: false,
      },
      order: [[searchParams.field, searchParams.sort]],
      limit: limit,
      offset: offset,
    });
    return res.status(200).json({
      current_page: page,
      total_pages: totalPages,
      total_groups: total_groups,
      groups: groups,
    });
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
 *      201:
 *        description: Created
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
 *      400:
 *        description: Data has empty fields
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Data has empty fields"
 *      401:
 *        description: User is not admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User must be admin"
 *      403:
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
async function createGroupHandler(req, res) {
  if (req.verifyResult.is_admin == false) {
    return res.status(401).json({ error: `Only admins can create groups` });
  }
  let group = new db.Groups();
  if (req.body.name == null || req.body.description == null) {
    return res.status(400).json({ error: `Data has empty fields` });
  }
  for (let key in req.body) {
    group[key] = req.body[key];
  }
  try {
    await group.save();
    return res.status(201).json(group);
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
 *        in: query
 *        require: true
 *        type: string
 *        example: COVID-19
 *      - name: field
 *        in: query
 *        require: true
 *        type: string
 *        example: username
 *      - name: sort
 *        in: query
 *        require: true
 *        type: string
 *        example: asc
 *      - name: page
 *        in: query
 *        require: true
 *        type: string
 *        example: 1
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
 *                  images:
 *                    type: array
 *                    item:
 *                      type: object
 *                      properties:
 *                        url:
 *                          type: string
 *              example:
 *                - id_request: 2
 *                  id_group: 1
 *                  username: seeding.user.3
 *                  content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. fishes\n2. pumpkin\n3. eggs\n4. rice
 *                  is_deleted: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_approved: false
 *                  images:
 *                    - url: "https://viraland.vn/wp-content/uploads/2020/04/Thue-phong-tro-da-nang-theo-nhu-cau.jpg"
 *                    - url: "http://baoninhbinh.org.vn/DATA/ARTICLES/2020/10/19/ho-tro-nguoi-dan-vuot-qua-kho-khan-va-khac-phuc-hau-qua-11543.jpg"
 *                - id_request: 5
 *                  id_group: 1
 *                  username: seeding.user.9
 *                  content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. cookies\n2. fishes\n3. instant noodles\n4. pumpkin\n5. apples
 *                  is_deleted: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_approved: false
 *                  images: []
 *      400:
 *        description: page is not integer/ page is less than 0/ page is larger total page
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Page must be an integer"
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
      field: req.query.field || "date_created",
      sort: req.query.sort || "desc",
    };
    const page = req.query.page;
    if (page == null) {
      let requests = await db.Requests.findAll({
        where: {
          is_deleted: false,
          id_group: groupId,
          content: { [Op.like]: `%${searchParams.search}%` },
        },
        order: [[searchParams.field, searchParams.sort]],
        include: [
          {
          model: db.Images,
          as: "images",
          attributes: ["url"],
          },
          {
            model: db.Profiles,
            as: 'user',
          },
          {
            model: db.Reactions,
            as: 'reactions',
          },
          {
            model: db.Comments,
            as: 'comments',
          },
          {
            model: db.Supports,
            as: 'supports',
          }
        ],
      });
      for ( var i = 0; i < requests.length; i++) {
        requests[i].dataValues.reactions = requests[i].dataValues.reactions.length;
        requests[i].dataValues.comments = requests[i].dataValues.comments.length;
        requests[i].dataValues.supports = requests[i].dataValues.supports.length;
      }
      return res.status(200).json(requests);
    }
    total_requests = await db.Requests.count({
      where: {
        is_deleted: false,
        id_group: groupId,
        content: { [Op.like]: `%${searchParams.search}%` },
      },
    });
    const { limit, offset, totalPages } = await pagination(
      total_requests,
      page,
      res
    );
    let requests = await db.Requests.findAll({
      where: {
        is_deleted: false,
        id_group: groupId,
        content: { [Op.like]: `%${searchParams.search}%` },
      },
      order: [[searchParams.field, searchParams.sort]],
      include: [
        {
        model: db.Images,
        as: "images",
        attributes: ["url"],
        },
        {
          model: db.Profiles,
          as: 'user',
        },
        {
          model: db.Reactions,
          as: 'reactions',
        },
        {
          model: db.Comments,
          as: 'comments',
        },
        {
          model: db.Supports,
          as: 'supports',
        },
      ],
      limit: limit,
      offset: offset,
    });
    for ( var i = 0; i < requests.length; i++) {
      requests[i].dataValues.reactions = requests[i].dataValues.reactions.length;
      requests[i].dataValues.comments = requests[i].dataValues.comments.length;
      requests[i].dataValues.supports = requests[i].dataValues.supports.length;
    }
    return res.status(200).json({
      current_page: page,
      total_pages: totalPages,
      total_requests: total_requests,
      requests: requests,
    });
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
 *              images:
 *                type: array
 *                item:
 *                  type: object
 *                  properties:
 *                    url:
 *                      type: string
 *            example:
 *              content: cần hổ trợ lương thực, thực phẩm
 *              images: []
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id_request:
 *                  type: int
 *                id_group:
 *                  type: int
 *                username:
 *                  type: string
 *                content:
 *                  type: string
 *                is_deleted:
 *                  type: boolean
 *                date_created:
 *                  type: string
 *                is_approved:
 *                  type: boolean
 *                images:
 *                  type: array
 *                  item:
 *                    type: object
 *                    properties:
 *                      url:
 *                        type: string
 *              example:
 *                id_request: 1
 *                id_group: 2
 *                username: seeding.user.1
 *                content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. instant noodles\n2. milk\n3. pumpkin\n4. eggs
 *                is_deleted: true
 *                date_created: 2021-10-29T13:36:48.562Z
 *                is_approved: true
 *                images: []
 *      400:
 *        description: User is not member of group/ Content is null/ "images" field does not contain objects with key "url" / image url not valid
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "{username} is not member of ${id_group}"
 *      403:
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
  if (isNaN(parseInt(req.body.id_group))) {
    return res.status(400).json({ error: `id_group must be an integer` });
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
      return res.status(400).json({
        error: `${req.body.username} is not a member of ${req.body.group_id}`,
      });
    }
    if (req.body.content == null) {
      return res.status(400).json({ error: `content is null` });
    }
    let request = new db.Requests();
    for (let key in req.body) {
      request[key] = req.body[key];
    }
    await request.save();
    let tasks = [];
    for (let image of request.images) {
      tasks.push(
        db.Images.create({
          id_request: request.id_request,
          object_type: 0,
          url: image.url,
        })
      );
    }
    await Promise.all(tasks);
    request.dataValues.images = await request.getImages({
      attributes: ["url"],
    });
    return res.status(201).json(request);
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
  .post(
    authUserMiddleware,
    validateImagesParamMiddleware,
    createGroupRequestHandler
  );
groupsRouter.use("/:id_group/requests", groupRequestRouter);

module.exports = { router: groupsRouter, name: "groups" };
