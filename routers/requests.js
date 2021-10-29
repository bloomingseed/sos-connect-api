var express = require("express");
var db = require("../models");
var { authUserMiddleware, getUserMiddleware } = require("../helpers");
var Op = require("sequelize").Op;

var requestsRouter = express.Router();
var requestSupportsRouter = express.Router({ mergeParams: true });

// feature 8
// PUT /requests/:id_request
async function adminSetsApprovalHandler(req, res) {
  if (req.user.is_admin == false) {
    return res.status(401).json({ error: `Only admins can approve requests` });
  }
  let requestId = req.params.id_request;
  let request = await db.Requests.findByPk(requestId);
  if (request == null) {
    return res
      .status(400)
      .json({ error: `Request ID ${requestId} does not exist` });
  }
  let isApproved = req.body.is_approved || true
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
  try {
    let supports = await db.Supports.findAll({
      where: {
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
  let support = new db.Supports({
    id_request:requestId,
    username: usernameB,
    content: req.body.content
  })
  try {
    // await db.Supports.create(req.body);
    await support.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

requestsRouter.use("/:id_request/supports", requestSupportsRouter);
requestsRouter
  .route("/:id_request")
  .put(authUserMiddleware, getUserMiddleware, adminSetsApprovalHandler);
requestSupportsRouter
  .route("/")
  .get(listRequestSupportsHandler)
  .post(authUserMiddleware, createSupportHandler);

module.exports = { router: requestsRouter, name: "requests" };
