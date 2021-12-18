var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");

var commentsRouter = express.Router();

/**
 * @swagger
 * tags: 
 *  name: comments
 *  description: Comments related APIs
 */

//get comment middleware
async function getComment(id_comment, res) {
  if (isNaN(parseInt(id_comment))) {
    return res.status(400).json({ error: `id_comment must be an integer`});
  }
  let comment = await db.Comments.findByPk(id_comment);
  if (comment == null) {
    return res
      .status(400)
      .json({ error: `comment ${id_comment} does not exist` });
  }
  return comment;
}

/**
 * @swagger
 * /comments/{id_comment}:
 *  get:
 *    summary: Show a comment infomation
 *    tags:
 *      - comments
 *    parameters:
 *      - name: id_comment
 *        in: path
 *        require: true
 *        schema:
 *          type: int
 *          example: 1
 *    responses:
 *      200:
 *        description: Return comment information
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id_comment:
 *                  type:int
 *                id_request:
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
 *                id_comment: 1
 *                id_request: 1
 *                id_support: null
 *                username: seeding.user.1
 *                object_type: 0
 *                content: comment request
 *                is_deleted: false
 *                date_created: 2021-12-18T12:57:40.000Z
 *      400:
 *        description: Request does not exist/ id_comment is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Comment ${id_comment} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function getCommentHandler(req, res){
  try {
    let comment = await getComment(req.params.id_comment, res);
    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /comments/{id_comment}:
 *  put:
 *    summary: Update a comment
 *    tags:
 *      - comments
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id_comment
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
 *              content: comment
 *    responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: Request does not exist/ id_comment is not integer/ Content is empty
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Comment ${id_comment} does not exist"
 *      401:
 *        description: User is not the creator of the comment
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User must be ${comment.username}"
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
async function updateCommentHandler(req, res){
  try {
    let content = req.body.content;
    if (content == null){
      return res.status(400).json({ error: `Content is empty` });
    }
    let comment = await getComment(req.params.id_comment, res);
    if (req.verifyResult.username != comment.username){
      return res
        .status(401)
        .json({ error: `User must be ${comment.username}` });
    }
    comment.content= content;
    await comment.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /comments/{id_comment}:
 *  delete:
 *    summary: User deleted comment
 *    tags:
 *      - comments
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Deleted
 *      400:
 *        description: Request does not exist/ id_comment is not integer
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Comment ${id_comment} does not exist"
 *      401:
 *        description: User is not the creator of the comment
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
async function deleteCommentHandler(req, res){
  try {
    let comment = await getComment(req.params.id_comment, res);
    if (req.verifyResult.username != comment.username){
      return res
        .status(401)
        .json({ error: `User must be ${comment.username}` });
    }
    comment.is_deleted = true;
    await comment.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

commentsRouter
  .route("/:id_comment")
  .get(getCommentHandler)
  .put(authUserMiddleware, updateCommentHandler)
  .delete( authUserMiddleware, deleteCommentHandler);

module.exports = { router: commentsRouter, name: "comments" };
