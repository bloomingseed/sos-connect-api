var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

const DUP_KEY_ERRCODE = "23505";
var profilesRouter = express.Router();
var profileRequestsRouter = express.Router({ mergeParams: true});

/**
 * @swagger
 * tags: 
 *  name: profiles
 *  description: Profiles related APIs
 */


/**
 * @swagger
 * /profiles:
 *  get:
 *    summary: admin get list profiles
 *    tags:
 *      - profiles
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Return list profiles
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              item:
 *                type: object
 *                properties:
 *                  username:
 *                    type:string
 *                  last_name:
 *                    type: string
 *                  first_name:
 *                    type: string
 *                  gender:
 *                    type: boolean
 *                  avatar_url:
 *                    type: string
 *                  date_of_birth:
 *                    type: string
 *                  country:
 *                    type: string
 *                  province:
 *                    type: string
 *                  district:
 *                    type: string
 *                  ward:
 *                    type: string
 *                  street:
 *                    type: string
 *                  email:
 *                    type: string
 *                  phone_number:
 *                    type: string
 *                  is_deactivated:
 *                    type: boolean
 *                  is_deleted:
 *                    type: boolean
 *              example:
 *                - username: seeding.user.1
 *                  last_name: Seeding
 *                  first_name: User 1
 *                  gender: true
 *                  avatar_url: null
 *                  date_of_birth: 2000-01-01
 *                  country: Việt Nam
 *                  province: Đà Nẵng
 *                  district: Liên Chiểu
 *                  ward: Hòa Khánh Bắc
 *                  street: 1 Tôn Đức Thắng
 *                  email: "seeding1@mail"
 *                  phone_number: 0123456789
 *                  is_deactivated: false
 *                  is_deleted: false
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
async function listProfilesHandler(req, res){
  if (req.verifyResult.is_admin === false){
    return res.status(401).json({ error: `User must be admin`})
  }
  try {
    let profiles = await db.Profiles.findAll();
    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

/**
 * @swagger
 * /profiles:
 *  post:
 *    summary: User create profile
 *    tags:
 *      - profiles
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              last_name:
 *                type: string
 *              first_name:
 *                type: string
 *              gender:
 *                type: boolean
 *              date_of_birth:
 *                type: string
 *              country:
 *                type: string
 *              province:
 *                type: string
 *              district:
 *                type: string
 *              ward:
 *                type: string
 *              street:
 *                type: string
 *            example:
 *              last_name: Seeding
 *              first_name: User 1
 *              gender: true
 *              date_of_birth: 2000-01-01
 *              country: Việt Nam
 *              province: Đà Nẵng
 *              district: Liên Chiểu
 *              ward: Hòa Khánh Bắc
 *              street: 1 Tôn Đức Thắng
 *    responses:
 *      200:
 *        description: Created
 *      400:
 *        description: User has profile
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "User {username} has already"
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
async function createProfileHandler(req, res){
  try {
    req.body.username = req.verifyResult.username;
    let profile = new db.Profiles();
    if( req.body.last_name == null || req.body.first_name == null || req.body.gender == null || req.body.date_of_birth == null ||
      req.body.country == null || req.body.province == null || req.body.district == null || req.body.ward == null || req.body.street == null){
        return res.status(400).json({ error: `Data has empty fields`});
    }
    for (let key in req.body){
      profile[key] = req.body[key];
    }
    await profile.save();
    return res.sendStatus(200);
  } catch (error) {
    if (error.parent.code == DUP_KEY_ERRCODE || error.parent.code == "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: `User ${req.verifyResult.username} has already`,
      });
    }
    return res.status(500).json({ error: error});
  }
}

//get user profile middleware
async function getUserProfile(username, res){
  let profile = await db.Profiles.findByPk(username);
  if (profile == null) {
    return res.status(400).json({ error: `Username ${username} does not exist`});
  }
  return profile;
}

/**
 * @swagger
 * /profiles/{username}:
 *  get:
 *    summary: Show a user profile
 *    tags:
 *      - profiles
 *    parameters:
 *      - name: username
 *        in: path
 *        require: true
 *        schema:
 *          type: string
 *          example: nvc
 *    responses:
 *      200:
 *        description: Return user profile
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                last_name:
 *                  type: string
 *                first_name:
 *                  type: string
 *                gender:
 *                  type: boolean
 *                avatar_url:
 *                  type: string
 *                date_of_birth:
 *                  type: string
 *                country:
 *                  type: string
 *                province:
 *                  type: string
 *                district:
 *                  type: string
 *                ward:
 *                  type: string
 *                street:
 *                  type: string
 *                email:
 *                  type: string
 *                phone_number:
 *                  type: string
 *                is_deactivated:
 *                  type: boolean
 *                is_deleted:
 *                  type: boolean
 *              example:
 *                username: nvc
 *                last_name: Nguyễn Văn
 *                first_name: Cường
 *                gender: true
 *                avatar_url: null
 *                date_of_birth: 2000-07-23
 *                country: Việt Nam
 *                province: Đà Nẵng
 *                district: Liên Chiểu
 *                ward: Hòa Khánh Bắc
 *                street: 1 Ngô Thì Nhậm
 *                email: "nvc@mail"
 *                phone_number: 0132456789
 *                is_deactivated: false
 *                is_deleted: false
 *      400:
 *        description: User does not exist
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Username ${username} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function getUserProfileHandler(req, res){
  let username = req.params.username;
  try {
    let profile = await getUserProfile(username, res);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

/**
 * @swagger
 * /profiles/{username}:
 *  put:
 *    summary: User joins a group
 *    tags:
 *      - profiles
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              last_name:
 *                type: string
 *              first_name:
 *                type: string
 *              gender:
 *                type: boolean
 *              date_of_birth:
 *                type: string
 *              country:
 *                type: string
 *              province:
 *                type: string
 *              district:
 *                type: string
 *              ward:
 *                type: string
 *              street:
 *                type: string
 *            example:
 *              last_name: Seeding
 *              first_name: User 1
 *              gender: true
 *              date_of_birth: 2000-01-01
 *              country: Việt Nam
 *              province: Đà Nẵng
 *              district: Liên Chiểu
 *              ward: Hòa Khánh Bắc
 *              street: 1 Tôn Đức Thắng
 *    responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: User does not exist
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Username ${username} does not exist"
 *      401:
 *        description: Failed to authorize request/ Access token is invalid/ User is not username
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
async function updateUserProfileHandler(req, res){
  let username = req.params.username;
  if (req.verifyResult.username != username){
    return res.status(401).json({ error: `User must be ${username}` });
  }
  try {
    let profile = await getUserProfile(username, res);
    for (let key in req.body) {
      if (key == "is_deleted") continue;
      if( req.body[key] == null){
        return res.status(400).json({ error: `Data has empty fields`});
      }
      profile[key] = req.body[key];
    }
    await profile.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

/**
 * @swagger
 * /profiles/{username}:
 *  delete:
 *    summary: User deleted profile
 *    tags:
 *      - profiles
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Deleted
 *      400:
 *        description: User does not exist
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Username ${username} does not exist"
 *      401:
 *        description: Failed to authorize request/ Access token is invalid/ User is not username
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
async function deleteUserProfileHandler(req, res){
  let username = req.params.username;
  if (req.verifyResult.username != username){
    return res.status(401).json({ error: `User must be ${username}` });
  }
  try {
    let profile = await getUserProfile(username, res);
    profile.is_deleted= true;
    profile.save();
    return res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

/**
 * @swagger
 * /profiles/{username}/requests:
 *  get:
 *    summary: Show list requests of a user
 *    tags:
 *      - profiles
 *    parameters:
 *      - name: username
 *        in: path
 *        require: true
 *        schema:
 *          type: string
 *          example: seeding.user.1
 *    responses:
 *      200:
 *        description: Return list requests
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
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
 *                - id_request: 1
 *                  id_group: 2
 *                  username: seeding.user.1
 *                  content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. fishes\n2. pumpkin\n3. eggs\n4. rice
 *                  is_deleted: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_approved: false
 *                - id_request: 11
 *                  id_group: 2
 *                  username: seeding.user.1
 *                  content: COVID-19 impacts our lives heavily. We are in needed of these items:\n        1. cookies\n2. fishes\n3. instant noodles\n4. pumpkin\n5. apples
 *                  is_deleted: false
 *                  date_created: 2021-10-29T13:36:48.562Z
 *                  is_approved: false
 *      400:
 *        description: User does not exist
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Username ${username} does not exist"
 *      500:
 *        description: Account failed to register due to server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error"
 */
async function getListProfileRequestsHandler(req, res){
  let username = req.params.username;
  try {
    await getUserProfile(username, res);
    let requests = await db.Requests.findAll({
      where: { 
        username: username,
        is_deleted: false,
      },
    });
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

profilesRouter
  .route("/")
  .get(authUserMiddleware, listProfilesHandler)
  .post(authUserMiddleware, createProfileHandler);
profilesRouter
  .route("/:username")
  .get(getUserProfileHandler)
  .put(authUserMiddleware, updateUserProfileHandler)
  .delete(authUserMiddleware, deleteUserProfileHandler);
profileRequestsRouter
  .route("/")
  .get(getListProfileRequestsHandler);
profilesRouter.use("/:username/requests", profileRequestsRouter)

module.exports = { router: profilesRouter, name: "profiles" };
