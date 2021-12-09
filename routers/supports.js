var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");

var supportsRouter = express.Router();

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
  if (typeof parseInt(supportId) !== "number") {
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
 *              example:
 *                id_request: 1
 *                id_group: 1
 *                username: seeding.user.10
 *                content: I dont have the items needed but i will send you some $$$
 *                is_confirmed: false
 *                date_created: 2021-10-29T13:36:48.562Z
 *                is_deleted: false
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
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function getSupportHandler(req, res) {
  let supportId = req.params.id_support;
  if (typeof parseInt(supportId) !== "number") {
    return res.status(400).json({ error: `id_support must be an integer`});
  }
  try {
    let support = await db.Supports.findByPk(supportId);
    if (support == null) {
      return res
        .status(400)
        .json({ error: `Support ID ${supportId} does not exist` });
    }
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
 *        description: Failed to authorize request/ Access token is invalid/ User is not the creator of the request or support
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
 *        description: Failed to authorize request/ Access token is invalid/ User is not the creator of the support
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
  if (req.isUserOwnsSupport === false) {
    return res.sendStatus(401);
  }
  support.is_deleted = req.body.is_deleted || true;
  try {
    await support.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
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

module.exports = { router: supportsRouter, name: "supports" };
