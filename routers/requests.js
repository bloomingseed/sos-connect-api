var express = require("express");
var db = require("../models");
var { authUserMiddleware, getUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

var requestsRouter = express.Router();

//get request middleware
async function getRequest(id_request, res){
  let request = await db.Requests.findByPk(id_request);
  if (request == null) {
    return res.status(400).json({ error: `Request ${id_request} does not exist`});
  }
  return request;
}

//GET /requests/:id_request
async function getRequestHandler(req, res) {
  let id_request = req.params.id_request;
  try {
    let request =await getRequest(id_request, res);
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

//PUT /requests/:id_request
async function updateRequestHandler(req, res) {
  let id_request = req.params.id_request;
  try {
    let request = await getRequest(id_request, res);
    if (req.user.username != request.username){
      return res.status(401).json({ error: `User must be ${request.username}`})
    }
    for (let key in req.body) {
      if (key == "is_deleted") continue;
      request[key] = req.body[key];
    }
    await request.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

//DELETE /requests/:id_request
async function deleteRequestHandler(req, res) {
  let id_request = req.params.id_request;
  try {
    let request = await getRequest(id_request, res);
    if (req.user.username != request.username){
      return res.status(401).json({ error: `User must be ${request.username}`})
    }
    request.is_deleted = true;
    await request.save();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error});
  }
}

requestsRouter
  .route("/:id_request")
  .get(getRequestHandler)
  .put(authUserMiddleware, getUserMiddleware, updateRequestHandler)
  .delete(authUserMiddleware, getUserMiddleware, deleteRequestHandler);

module.exports = { router: requestsRouter, name: "requests" };
