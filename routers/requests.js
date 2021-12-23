var express = require("express");
var db = require("../models");
var {
  authUserMiddleware,
  validateImagesParamMiddleware,
  pagination,
} = require("../helpers");
var Op = require("sequelize").Op;

var requestsRouter = express.Router();
var requestSupportsRouter = express.Router({ mergeParams: true });
var requestReactionsRouter = express.Router({ mergeParams: true });
var requestCommentsRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *  name: requests
 *  description: Requests related APIs
 */

//get request middleware
async function getRequest(id_request, res) {
  if (isNaN(parseInt(id_request))) {
    return res.status(400).json({ error: `id_request must be an integer` });
  }
  let request = await db.Requests.findByPk(id_request, {
    include: {
      model: db.Profiles,
      as: 'user',
    },
  });
  if (request == null) {
    return res
      .status(400)
      .json({ error: `Request ${id_request} does not exist` });
  }
  return request;
}

/**
 * @swagger
 * /requests/{id_request}:
 *  put:
 *    summary: Admin approves a request
 *    tags:
 *      - requests
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              is_approved:
 *                type: boolean
 *            example:
 *              is_approved: true
 *    responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: Request does not exist
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
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
async function adminSetsApprovalHandler(req, res) {
  let requestId = req.params.id_request;
  let request = await getRequest(requestId, res);
  let isApproved = req.body.is_approved || true;
  request.is_approved = isApproved;
  try {
    await request.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

/**
 * @swagger
 * /requests/{id_request}/supports:
 *  get:
 *    summary: Show supports list for request
 *    tags:
 *      - requests
 *    parameters:
 *      - name: id_request
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
 *      - name: page
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      200:
 *        description: Return supports list for request
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              item:
 *                type: object
 *                properties:
 *                  id_support:
 *                    type:int
 *                  id_request:
 *                    type:int
 *                  username:
 *                    type:string
 *                  content:
 *                    type: string
 *                  is_confirmed:
 *                    type: boolean
 *                  date_created:
 *                    type: string
 *                  is_deleted:
 *                    type: boolean
 *                  images:
 *                    type: array
 *                    item:
 *                      type: object
 *                      properties:
 *                        url:
 *                          type: string
 *              example:
 *                - id_support: 1
 *                  id_request: 1
 *                  username: seeding.user.10
 *                  content: I dont have the items needed but i will send you some $$$
 *                  is_confirmed: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_deleted: false
 *                  images:
 *                    - url: "https://viraland.vn/wp-content/uploads/2020/04/Thue-phong-tro-da-nang-theo-nhu-cau.jpg"
 *                    - url: "http://baoninhbinh.org.vn/DATA/ARTICLES/2020/10/19/ho-tro-nguoi-dan-vuot-qua-kho-khan-va-khac-phuc-hau-qua-11543.jpg"
 *                - id_support: 2
 *                  id_request: 1
 *                  username: seeding.user.16
 *                  content: I dont have the items needed but i will send you some $$$
 *                  is_confirmed: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_deleted: false
 *                  images: []
 *      400:
 *        description: Request does not exist/ id_request is not integer/ page is not integer/ page is less than 0/ page is larger total page
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function listRequestSupportsHandler(req, res) {
  let searchParams = {
    search: req.query.search || "",
    field: req.query.field || "date_created",
    sort: req.query.sort || "desc",
  };
  if (isNaN(parseInt(req.params.id_request))) {
    return res.status(400).json({ error: `id_request must be an integer` });
  }
  const page = req.query.page;
  try {
    if (page == null) {
      let supports = await db.Supports.findAll({
        where: {
          id_request: req.params.id_request,
          username: { [Op.like]: `%${searchParams.search}%` },
          is_deleted: false,
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
        ],
      });
      return res.status(200).json(supports);
    }
    total_supports = await db.Supports.count({
      where: {
        id_request: req.params.id_request,
        username: { [Op.like]: `%${searchParams.search}%` },
        is_deleted: false,
      },
    });
    const { limit, offset, totalPages } = await pagination(
      total_supports,
      page,
      res
    );
    let supports = await db.Supports.findAll({
      where: {
        id_request: req.params.id_request,
        username: { [Op.like]: `%${searchParams.search}%` },
        is_deleted: false,
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
      ],
      limit: limit,
      offset: offset,
    });
    return res.status(200).json({
      current_page: page,
      total_pages: totalPages,
      total_supports: total_supports,
      supports: supports,
    });
  } catch (e) {
    return res.status(500).json({ error: e.parent });
  }
}

/**
 * @swagger
 * /requests/{id_request}/supports:
 *  post:
 *    summary: Create a support
 *    tags:
 *      - requests
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_request
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
 *              content: I dont have the items needed but i will send you some $$$
 *              images: []
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id_support:
 *                  type: int
 *                id_request:
 *                  type: int
 *                username:
 *                  type: string
 *                content:
 *                  type: string
 *                is_confirmed:
 *                  type: boolean
 *                date_created:
 *                  type: string
 *                is_deleted:
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
 *                id_group: 1
 *                username: seeding.user.10
 *                content: I dont have the items needed but i will send you some $$$
 *                is_confirmed: false
 *                date_created: 2021-10-29T13:36:48.562Z
 *                is_deleted: false
 *                images: []
 *      400:
 *        description: Request does not exist/ User is not the creator of the request/ User is not member of a group/ id_request is not integer/ "images" field does not contain objects with key "url" / image url not valid
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
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
async function createSupportHandler(req, res) {
  let requestId = req.params.id_request;
  if (isNaN(parseInt(requestId))) {
    return res.status(400).json({ error: `id_request must be an integer` });
  }
  let request = await db.Requests.findByPk(requestId, {
    include: { model: db.Groups, as: "group" },
  });
  if (request == null) {
    return res
      .status(400)
      .json({ error: `Request ID ${requestId} does not exist` });
  }
  let usernameB = req.verifyResult.username;
  if (request.username == usernameB) {
    return res.status(400).json({
      error: `Username of supporting user must be different from username of requesting user`,
    });
  }
  let isDifferentGroup =
    (
      await db.Members.findAll({
        where: { username: usernameB, id_group: request.group.id_group },
      })
    ).length == 0;
  if (isDifferentGroup) {
    return res.status(400).json({
      error: `Supporting user and requesting user must belong to the same group`,
    });
  }
  if (req.body.content == null) {
    return res.status(400).json({ error: `Data has empty fields` });
  }
  let support = new db.Supports({
    id_request: requestId,
    username: usernameB,
    content: req.body.content,
  });
  try {
    await support.save();

    let tasks = [];
    for (let image of req.body.images) {
      tasks.push(
        db.Images.create({
          id_support: support.id,
          object_type: 1,
          url: image.url,
        })
      );
    }
    support.images = req.body.images;
    await Promise.all(tasks);
    return res.status(201).json(support);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

/**
 * @swagger
 * /requests/{id_request}:
 *  get:
 *    summary: Show a request infomation
 *    tags:
 *      - requests
 *    parameters:
 *      - name: id_request
 *        in: path
 *        require: true
 *        schema:
 *          type: int
 *          example: 1
 *    responses:
 *      200:
 *        description: Return request infomation
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
 *                total_reactions:
 *                  type: int
 *                total_comments:
 *                  type: int
 *                total_supports:
 *                  type: int
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
 *                total_reactions: 5
 *                total_comments: 2
 *                total_supports: 1
 *                images: []
 *      400:
 *        description: Request does not exist/ id_request is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function getRequestHandler(req, res) {
  let id_request = req.params.id_request;
  try {
    let request = await getRequest(id_request, res);
    request.dataValues.total_reactions = await db.Reactions.count({
      where: {
        id_request: id_request,
        object_type: 0,
      },
    });
    request.dataValues.total_comments = await db.Comments.count({
      where: {
        id_request: id_request,
        object_type: 0,
      },
    });
    request.dataValues.total_supports = await db.Supports.count({
      where: {
        id_request: id_request,
      },
    });
    request.dataValues.images = await request.getImages({
      attributes: ["url"],
    });
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /requests/{id_request}:
 *  put:
 *    summary: Update a request
 *    tags:
 *      - requests
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_request
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
 *              content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. instant noodles\n2. milk\n3. pumpkin\n4. eggs
 *              images:
 *                - url: "https://vifon.com.vn/vnt_upload/product/mi/mi-tom-chua-cay-VIFON.png"
 *                - url: "https://hoianuong.vn/hinh-anh-trung-ga-ta/imager_89991.jpg"
 *    responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: Request does not exist/ id_request is not integer/ "images" field does not contain objects with key "url" / image url not valid
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
 *      401:
 *        description: User is not the creator of the request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User must be ${request.username}"
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
async function updateRequestHandler(req, res) {
  if (req.verifyResult.is_admin == true) {
    return adminSetsApprovalHandler(req, res);
  }
  let id_request = req.params.id_request;
  try {
    let request = await getRequest(id_request, res);
    if (req.verifyResult.username != request.username) {
      return res
        .status(401)
        .json({ error: `User must be ${request.username}` });
    }
    for (let key in req.body) {
      if (key == "is_deleted") continue;
      if (req.body[key] == null) {
        return res.status(400).json({ error: `Data has empty fields` });
      }
      request[key] = req.body[key];
    }
    await request.save();
    let tasks = [];
    tasks.push(request.deleteCurrentImages(db));
    for (let image of request.images) {
      tasks.push(
        db.Images.create({
          id_request: request.id_request,
          object_type: 0,
          url: image.url,
        })
      );
    }
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /requests/{id_request}:
 *  delete:
 *    summary: User deleted request
 *    tags:
 *      - requests
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Deleted
 *      400:
 *        description: Request does not exist/ id_request is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
 *      401:
 *        description: User is not the creator of the request and admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User must be ${request.username} or admin"
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
async function deleteRequestHandler(req, res) {
  let id_request = req.params.id_request;
  try {
    let request = await getRequest(id_request, res);
    if (
      req.verifyResult.username != request.username &&
      req.verifyResult.is_admin == false
    ) {
      return res
        .status(401)
        .json({ error: `User must be ${request.username} or admin` });
    }
    request.is_deleted = true;
    await request.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /requests/{id_request}/reactions:
 *  get:
 *    summary: Show reactions list for request
 *    tags:
 *      - requests
 *    parameters:
 *      - name: id_request
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      200:
 *        description: Return reactions list for request
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              item:
 *                type: object
 *                properties:
 *                  id_reaction:
 *                    type:int
 *                  id_request:
 *                    type:int
 *                  id_support:
 *                    type:int
 *                  username:
 *                    type: string
 *                  object_type:
 *                    type: int
 *              example:
 *                - id_reaction: 1
 *                  id_request: 1
 *                  id_support: null
 *                  username: seeding.user.1
 *                  object_type: 0
 *                - id_reaction: 2
 *                  id_request: 1
 *                  id_support: null
 *                  username: seeding.user.4
 *                  object_type: 0
 *      400:
 *        description: Request does not exist/ id_request is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function listRequestReactionsHandler(req, res) {
  try {
    await getRequest(req.params.id_request, res);
    let reactions = await db.Reactions.findAll({
      where: {
        id_request: req.params.id_request,
        object_type: 0,
      },
      include: {
        model: db.Profiles,
        as: 'user',
      }
    });
    return res.status(200).json({ reactions });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /requests/{id_request}/reactions:
 *  post:
 *    summary: Create a reaction
 *    tags:
 *      - requests
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_request
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id_reaction:
 *                  type:int
 *                id_request:
 *                  type:int
 *                username:
 *                  type: string
 *                object_type:
 *                  type: int
 *              example:
 *                id_reaction: 1
 *                id_request: 1
 *                username: seeding.user.1
 *                object_type: 0
 *      400:
 *        description: Request does not exist/ id_request is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
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
async function createReactionHandler(req, res) {
  try {
    await getRequest(req.params.id_request, res);
    let reaction = await db.Reactions.create({
      id_request: req.params.id_request,
      username: req.verifyResult.username,
      object_type: 0,
    });
    return res.status(201).json(reaction);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /requests/{id_request}/comments:
 *  get:
 *    summary: Show comments list for request
 *    tags:
 *      - requests
 *    parameters:
 *      - name: id_request
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *      - name: page
 *        in: query
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      200:
 *        description: Return reactions list for request
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
 *                total_comments:
 *                  type: int
 *                  example: 2
 *                comments:
 *                  type: object
 *                  properties:
 *                    id_comment:
 *                      type:int
 *                    id_request:
 *                      type:int
 *                    id_support:
 *                      type:int
 *                    username:
 *                      type: string
 *                    object_type:
 *                      type: int
 *                    content:
 *                      type:string
 *                    is_deleted:
 *                      type:boolean
 *                    date_created:
 *                      type:string
 *                  example:
 *                    - id_comment: 1
 *                      id_request: 1
 *                      id_support: null
 *                      username: seeding.user.1
 *                      object_type: 0
 *                      content: comment request
 *                      is_deleted: false
 *                      date_created: 2021-12-18T12:57:40.000Z
 *                    - id_comment: 2
 *                      id_request: 1
 *                      id_support: null
 *                      username: seeding.user.3
 *                      object_type: 0
 *                      content: comment request
 *                      is_deleted: false
 *                      date_created: 2021-12-19T12:57:40.000Z
 *      400:
 *        description: Request does not exist/ id_request is not integer/ page is not integer/ page is less than 0/ page is larger total page
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function listRequestCommentsHandler(req, res) {
  try {
    await getRequest(req.params.id_request, res);
    const page = req.query.page;
    if (page == null) {
      let comments = await db.Comments.findAll({
        where: {
          id_request: req.params.id_request,
          object_type: 0,
        },
        order: [["date_created", "desc"]],
        include: {
          model: db.Profiles,
          as: 'user',
        }
      });
      return res.status(200).json({ comments });
    }
    total_comments = await db.Comments.count({
      where: {
        id_request: req.params.id_request,
        object_type: 0,
      },
    });
    const { limit, offset, totalPages } = await pagination(
      total_comments,
      page,
      res
    );
    let comments = await db.Comments.findAll({
      where: {
        id_request: req.params.id_request,
        object_type: 0,
      },
      order: [["date_created", "desc"]],
      limit: limit,
      offset: offset,
      include: {
        model: db.Profiles,
        as: 'user',
      }
    });
    return res.status(200).json({
      current_page: page,
      total_pages: totalPages,
      total_comments: total_comments,
      comments: comments,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /requests/{id_request}/comments:
 *  post:
 *    summary: Create a comment
 *    tags:
 *      - requests
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_request
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id_comment:
 *                  type:int
 *                id_request:
 *                  type:int
 *                username:
 *                  type: string
 *                object_type:
 *                  type: int
 *                content:
 *                  type:string
 *                is_deleted:
 *                  type:boolean
 *                date_created:
 *                  type:string
 *              example:
 *                id_comment: 1
 *                id_request: 1
 *                username: seeding.user.1
 *                object_type: 0
 *                content: comment request
 *                is_deleted: false
 *                date_created: 2021-12-18T12:57:40.000Z
 *      400:
 *        description: Request does not exist/ id_request is not integer/ Content is empty
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Request ${id_request} does not exist"
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
async function createCommentHandler(req, res) {
  try {
    let content = req.body.content;
    if (content == null) {
      return res.status(400).json({ error: `Content is empty` });
    }
    await getRequest(req.params.id_request, res);
    let comment = await db.Comments.create({
      id_request: req.params.id_request,
      username: req.verifyResult.username,
      object_type: 0,
      content: content,
    });
    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

requestsRouter
  .route("/:id_request")
  .get(getRequestHandler)
  .put(authUserMiddleware, validateImagesParamMiddleware, updateRequestHandler)
  .delete(authUserMiddleware, deleteRequestHandler);
requestsRouter.use("/:id_request/supports", requestSupportsRouter);
requestSupportsRouter
  .route("/")
  .get(listRequestSupportsHandler)
  .post(
    authUserMiddleware,
    validateImagesParamMiddleware,
    createSupportHandler
  );
requestsRouter.use("/:id_request/reactions", requestReactionsRouter);
requestReactionsRouter
  .route("/")
  .get(listRequestReactionsHandler)
  .post(authUserMiddleware, createReactionHandler);
requestsRouter.use("/:id_request/comments", requestCommentsRouter);
requestCommentsRouter
  .route("/")
  .get(listRequestCommentsHandler)
  .post(authUserMiddleware, createCommentHandler);

module.exports = { router: requestsRouter, name: "requests" };
