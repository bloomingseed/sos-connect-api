var express = require("express");
var db = require("../models");
var { authUserMiddleware, pagination } = require("../helpers");

var supportsRouter = express.Router();
var supportReactionsRouter = express.Router({ mergeParams: true });
var supportCommentsRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags: 
 *  name: supports
 *  description: Supports related APIs
 */

// feature 11
async function isUserOwnsSupportMiddleware(req, res, next) {
  let username = req.verifyResult.username;
  let supportId = req.params.id_support;
  if (isNaN(parseInt(supportId))) {
    return res.status(400).json({ error: `id_support must be an integer`});
  }
  let support = await db.Supports.findByPk(supportId, {
    include: { model: db.Requests, as: "request" },
  });
  if (support == null) {
    return res
      .status(400)
      .json({ error: `Support ID ${supportId} does not exist` });
  }
  req.isUserOwnsSupport = support.username == username;
  req.support = support;
  next();
}

/**
 * @swagger
 * /supports/{id_support}:
 *  get:
 *    summary: Show a support infomation
 *    tags:
 *      - supports
 *    parameters:
 *      - name: id_support
 *        in: path
 *        require: true
 *        schema:
 *          type: int
 *          example: 1
 *    responses:
 *      200:
 *        description: Return support infomation
 *        
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
 *                total_reactions:
 *                  type: int
 *                total_comments:
 *                  type: int
 *              example:
 *                id_request: 1
 *                id_group: 1
 *                username: seeding.user.10
 *                content: I dont have the items needed but i will send you some $$$
 *                is_confirmed: false
 *                date_created: 2021-10-29T13:36:48.562Z
 *                is_deleted: false
 *                total_reactions: 2
 *                total_comments: 1
 *      400:
 *        description: Support does not exist/ id_support is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Support ID ${id_support} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function getSupportHandler(req, res) {
  let supportId = req.params.id_support;
  if (isNaN(parseInt(supportId))) {
    return res.status(400).json({ error: `id_support must be an integer`});
  }
  try {
    let support = await db.Supports.findByPk(supportId);
    if (support == null) {
      return res
        .status(400)
        .json({ error: `Support ID ${supportId} does not exist` });
    }
    support.dataValues.total_reactions = await db.Reactions.count({
      where: {
        id_support: supportId,
        object_type: 1,
      },
    });
    support.dataValues.total_comments = await db.Comments.count({
      where: {
        id_support: supportId,
        object_type: 1,
      },
    });
    return res.status(200).json(support);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

/**
 * @swagger
 * /supports/{id_support}:
 *  put:
 *    summary: update a support
 *    tags:
 *      - supports
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_support
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
 *              is_confirmed:
 *                type: boolean
 *              content:
 *                type: string
 *            example:
 *              is_confirmed: true
 *              content: I dont have the items needed but i will send you some $$$
 *              
 *    responses:
 *      200:
 *        description: Confirmed
 *      400:
 *        description: Support does not exist/ id_support is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Support ID ${id_support} does not exist"
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
async function updateSupportHandler(req, res) {
  let username = req.verifyResult.username;
  let support = req.support;
  if (req.isUserOwnsSupport === false) {
    if (username == support.request.username) {
      // user A confirms support
      support.is_confirmed = req.body.is_confirmed || true;
      try{
        await support.save();
        return res.sendStatus(200);
      } catch(e){
        return res.status(500).json({error:e});
      }
    }
    // unauthorized
    return res.sendStatus(401);
  }
  support.content = req.body.content || support.content; // updates support info
  try {
    await support.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

/**
 * @swagger
 * /supports/{id_support}:
 *  delete:
 *    summary: Delete a support
 *    tags:
 *      - supports
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_support
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      200:
 *        description: Deleted
 *      400:
 *        description: Support does not exist
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Support ID ${id_support} does not exist"
 *      401:
 *        description: User is not the creator of the support and admin
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User must be ${support.username} or admin"
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
// DELETE /supports/:id_support
async function deleteSupportHandler(req, res) {
  let username = req.verifyResult.username;
  let support = req.support;
  if (req.isUserOwnsSupport === false && req.verifyResult.is_admin == false) {
    return res
        .status(401)
        .json({ error: `User must be ${support.username} or admin` });
  }
  support.is_deleted = req.body.is_deleted || true;
  try {
    await support.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

async function getSupport(id_support, res) {
  if (isNaN(parseInt(id_support))) {
    return res.status(400).json({ error: `id_support must be an integer`});
  }
  let support = await db.Supports.findByPk(id_support);
  if (support == null) {
    return res
      .status(400)
      .json({ error: `Support ${id_support} does not exist` });
  }
  return support;
}

/**
 * @swagger
 * /supports/{id_support}/reactions:
 *  get:
 *    summary: Show reactions list for request
 *    tags:
 *      - supports
 *    parameters:
 *      - name: id_support
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      200:
 *        description: Return reactions list for support
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
 *                  id_request: null
 *                  id_support: 1
 *                  username: seeding.user.1
 *                  object_type: 1
 *                - id_reaction: 2
 *                  id_request: null
 *                  id_support: 1
 *                  username: seeding.user.4
 *                  object_type: 1
 *      400:
 *        description: Request does not exist/ id_support is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Support ${id_support} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function listSupportReactionsHandler(req, res){
  try {
    await getSupport(req.params.id_support, res);
    let reactions = await db.Reactions.findAll({
      where: {
        id_support: req.params.id_support,
        object_type: 1,
      }
    });
    return res.status(200).json({ reactions});
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /supports/{id_support}/reactions:
 *  post:
 *    summary: Create a reaction
 *    tags:
 *      - supports
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_support
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
 *                id_support:
 *                  type:int
 *                username:
 *                  type: string
 *                object_type:
 *                  type: int
 *              example:
 *                id_reaction: 1
 *                id_support: 1
 *                username: seeding.user.1
 *                object_type: 1
 *      400:
 *        description: Request does not exist/ id_support is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Support ${id_support} does not exist"
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
async function createReactionHandler(req, res){
  try {
    await getSupport(req.params.id_support, res);
    let reaction = await db.Reactions.create({
      id_support: req.params.id_support,
      username: req.verifyResult.username,
      object_type: 1,
    });
    return res.status(201).json(reaction);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /supports/{id_support}/comments:
 *  get:
 *    summary: Show comments list for request
 *    tags:
 *      - supports
 *    parameters:
 *      - name: id_support
 *        required: true
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *      - name: page
 *        in: path
 *        require: true
 *        type: string
 *        example: 1
 *    responses:
 *      200:
 *        description: Return comments list for support
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
 *                    - id_comment: 4
 *                      id_request: null
 *                      id_support: 1
 *                      username: seeding.user.1
 *                      object_type: 1
 *                      content: comment support
 *                      is_deleted: false
 *                      date_created: 2021-12-18T12:57:40.000Z
 *                    - id_comment: 6
 *                      id_request: null
 *                      id_support: 1
 *                      username: seeding.user.3
 *                      object_type: 1
 *                      content: comment support
 *                      is_deleted: false
 *                      date_created: 2021-12-19T12:57:40.000Z
 *      400:
 *        description: Request does not exist/ id_support is not integer/ page is not integer/ page is less than 0/ page is larger total page
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Support ${id_support} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function listSupportCommentsHandler(req, res){
  try {
    await getSupport(req.params.id_support, res);
    const page = req.query.page;
    if (page == null) {
      let comment = await db.Comments.findAll({
        where: {
          id_support: req.params.id_support,
          object_type: 1,
        },
        order: [['date_created', 'desc']],
      });
      return res.status(200).json({ comment});
    }
    total_comments = await db.Comments.count({
      where: {
        id_support: req.params.id_support,
        object_type: 1,
      },
    });
    const { limit, offset, totalPages } = await pagination(total_comments, page, res);
    let comments = await db.Comments.findAll({
      where: {
        id_support: req.params.id_support,
        object_type: 1,
      },
      order: [['date_created', 'desc']],
      limit: limit,
      offset: offset,
    });
    return res.status(200).json({
      current_page: page,
      total_pages: totalPages,
      total_comments: total_comments,
      comments: comments
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /supports/{id_support}/comments:
 *  post:
 *    summary: Create a comment
 *    tags:
 *      - supports
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_support
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
 *                id_support:
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
 *                id_comment: 5
 *                id_support: 1
 *                username: seeding.user.1
 *                object_type: 0
 *                content: comment support
 *                is_deleted: false
 *                date_created: 2021-12-18T12:57:40.000Z
 *      400:
 *        description: Request does not exist/ id_support is not integer/ Content is empty
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Support ${id_support} does not exist"
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
async function createCommentHandler(req, res){
  try {
    await getSupport(req.params.id_support, res);
    let content = req.body.content;
    if (content == null){
      return res.status(400).json({ error: `Content is empty` });
    }
    let comment = await db.Comments.create({
      id_support: req.params.id_support,
      username: req.verifyResult.username,
      object_type: 1,
      content: content,
    });
    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

supportsRouter
  .route("/:id_support")
  .get(getSupportHandler)
  .put(authUserMiddleware, isUserOwnsSupportMiddleware, updateSupportHandler)
  .delete(
    authUserMiddleware,
    isUserOwnsSupportMiddleware,
    deleteSupportHandler
  );
supportsRouter.use("/:id_support/reactions", supportReactionsRouter);
supportReactionsRouter
  .route("/")
  .get(listSupportReactionsHandler)
  .post(authUserMiddleware, createReactionHandler);
supportsRouter.use("/:id_support/comments", supportCommentsRouter);
supportCommentsRouter
  .route("/")
  .get(listSupportCommentsHandler)
  .post(authUserMiddleware, createCommentHandler);

module.exports = { router: supportsRouter, name: "supports" };
