var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

var requestsRouter = express.Router();
var requestSupportsRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags: 
 *  name: requests
 *  description: Requests related APIs
 */

//get request middleware
async function getRequest(id_request, res) {
  if (typeof parseInt(id_request) !== "number") {
    return res.status(400).json({ error: `id_request must be an integer`});
  }
  let request = await db.Requests.findByPk(id_request);
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
 *        description: Request does not exist/ Data has fields wrong type
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
  if (typeof Boolean(isApproved) !== "boolean") {
    return res.status(400).json({ error: `Data has fields wrong type`});
  }
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
 *              example:
 *                - id_support: 1
 *                  id_request: 1
 *                  username: seeding.user.10
 *                  content: I dont have the items needed but i will send you some $$$
 *                  is_confirmed: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_deleted: false
 *                - id_support: 2
 *                  id_request: 1
 *                  username: seeding.user.16
 *                  content: I dont have the items needed but i will send you some $$$
 *                  is_confirmed: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_deleted: false
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
async function listRequestSupportsHandler(req, res) {
  let searchParams = {
    search: req.query.search || "",
    field: req.query.field || "id_support",
    sort: req.query.sort || "asc",
  };
  if (typeof parseInt(req.params.id_request) !== "number") {
    return res.status(400).json({ error: `id_request must be an integer`});
  }
  try {
    let supports = await db.Supports.findAll({
      where: {
        id_request: req.params.id_request,
        username: { [Op.like]: `%${searchParams.search}%` },
        is_deleted: false,
      },
      order: [[searchParams.field, searchParams.sort]],
    });
    return res.status(200).json(supports);
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
 *            example:
 *              content: I dont have the items needed but i will send you some $$$
 *    responses:
 *      201:
 *        description: Created
 *      content:
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
 *              example:
 *                id_request: 1
 *                id_group: 1
 *                username: seeding.user.10
 *                content: I dont have the items needed but i will send you some $$$
 *                is_confirmed: false
 *                date_created: 2021-10-29T13:36:48.562Z
 *                is_deleted: false
 *      400:
 *        description: Request does not exist/ User is not the creator of the request/ User is not member of a group/ id_request is not integer
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
  if (typeof parseInt(requestId) !== "number") {
    return res.status(400).json({ error: `id_request must be an integer`});
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
  if (req.body.content == null){
    return res.status(400).json({ error: `Data has empty fields`});
  }
  let support = new db.Supports({
    id_request: requestId,
    username: usernameB,
    content: req.body.content,
  });
  try {
    await support.save();
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
 *        
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
 *              example:
 *                id_request: 1
 *                id_group: 2
 *                username: seeding.user.1
 *                content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. instant noodles\n2. milk\n3. pumpkin\n4. eggs
 *                is_deleted: true
 *                date_created: 2021-10-29T13:36:48.562Z
 *                is_approved: true
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
 *            example:
 *              content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. instant noodles\n2. milk\n3. pumpkin\n4. eggs
 *    responses:
 *      200:
 *        description: Updated
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
      if( req.body[key] == null){
        return res.status(400).json({ error: `Data has empty fields`});
      }
      request[key] = req.body[key];
    }
    await request.save();
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
async function deleteRequestHandler(req, res) {
  let id_request = req.params.id_request;
  try {
    let request = await getRequest(id_request, res);
    if (req.verifyResult.username != request.username) {
      return res
        .status(401)
        .json({ error: `User must be ${request.username}` });
    }
    request.is_deleted = true;
    await request.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

requestsRouter
  .route("/:id_request")
  .get(getRequestHandler)
  .put(authUserMiddleware, updateRequestHandler)
  .delete(authUserMiddleware, deleteRequestHandler);
requestsRouter.use("/:id_request/supports", requestSupportsRouter);
requestSupportsRouter
  .route("/")
  .get(listRequestSupportsHandler)
  .post(authUserMiddleware, createSupportHandler);

module.exports = { router: requestsRouter, name: "requests" };
