var express = require("express");
var db = require("../models");
var { authUserMiddleware, getUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

const DUP_KEY_ERRCODE = "23505";
var profilesRouter = express.Router();
var profileRequestsRouter = express.Router({ mergeParams: true});

//GET /profiles
//admin get all profiles
async function listProfilesHandler(req, res){
  if (req.user.is_admin === false){
    return res.status(401).json({ error: `User must be admin`})
  }
  try {
    let profiles = await db.Profiles.findAll();
    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

//POST /profiles
async function createProfileHandler(req, res){
  try {
    req.body.username = req.verifyResult.username;
    let profile = new db.Profiles();
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

//GET /profiles/:username
async function getUserProfileHandler(req, res){
  let username = req.params.username;
  try {
    let profile = await getUserProfile(username, res);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

//PUT /profiles/:username
async function updateUserProfileHandler(req, res){
  let username = req.params.username;
  if (req.user.username != username){
    return res.status(401).json({ error: `User must be ${username}` });
  }
  try {
    let profile = await getUserProfile(username, res);
    for (let key in req.body) {
      if (key == "is_deleted") continue;
      profile[key] = req.body[key];
    }
    await profile.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

//DELETE /profiles/:username
async function deleteUserProfileHandler(req, res){
  let username = req.params.username;
  if (req.user.username != username){
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

//GET /profiles/:username/requests
async function getListProfileRequestsHandler(req, res){
  let username = req.params.username;
  try {
    await getUserProfile(username, res);
    let requests = await db.Requests.findAll({
      where: { username: username },
    });
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

profilesRouter
  .route("/")
  .get(authUserMiddleware, getUserMiddleware, listProfilesHandler)
  .post(authUserMiddleware, createProfileHandler);
profilesRouter
  .route("/:username")
  .get(getUserProfileHandler)
  .put(authUserMiddleware, getUserMiddleware, updateUserProfileHandler)
  .delete(authUserMiddleware, getUserMiddleware, deleteUserProfileHandler);
profileRequestsRouter
  .route("/")
  .get(getListProfileRequestsHandler);
profilesRouter.use("/:username/requests", profileRequestsRouter)

module.exports = { router: profilesRouter, name: "profiles" };
