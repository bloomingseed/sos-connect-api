var express = require("express");
var db = require("../models");
var { authUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

var requestsRouter = express.Router();
var requestSupportsRouter = express.Router({ mergeParams: true });

//get request middleware
async function getRequest(id_request, res) {
  if (typeof id_request !== "int") {
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

// feature 8
// PUT /requests/:id_request
async function adminSetsApprovalHandler(req, res) {
  let requestId = req.params.id_request;
  let request = await getRequest(requestId, res);
  let isApproved = req.body.is_approved || true;
  if (typeof isApproved !== "boolean") {
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
// GET /requests/:id_request/supports
async function listRequestSupportsHandler(req, res) {
  let searchParams = {
    search: req.query.search || "",
    field: req.query.field || "id_support",
    sort: req.query.sort || "asc",
  };
  if (typeof req.params.id_request !== "int") {
    return res.status(400).json({ error: `id_request must be an integer`});
  }
  try {
    let supports = await db.Supports.findAll({
      where: {
        id_request: req.params.id_request,
        username: { [Op.like]: `%${searchParams.search}%` },
      },
      order: [[searchParams.field, searchParams.sort]],
    });
    return res.status(200).json(supports);
  } catch (e) {
    return res.status(500).json({ error: e.parent });
  }
}

// feature 11
// POST /requests/:id_request/supports
async function createSupportHandler(req, res) {
  let requestId = req.params.id_request;
  if (typeof requestId !== "int") {
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
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

// feature 10
//GET /requests/:id_request
async function getRequestHandler(req, res) {
  let id_request = req.params.id_request;
  try {
    let request = await getRequest(id_request, res);
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

//PUT /requests/:id_request
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

//DELETE /requests/:id_request
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
