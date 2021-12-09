var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");

var supportsRouter = express.Router();

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
// GET /supports/:id_support
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
// PUT /supports/:id_support
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
