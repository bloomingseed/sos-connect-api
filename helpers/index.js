var jwt = require("jsonwebtoken");
var config = require("../config");
var db = require("../models");

function getAuthToken(req) {
  let authHeader = req.get("Authorization");
  return authHeader && authHeader.split(" ")[1];
}
function authUserMiddleware(req, res, next) {
  let accessToken = getAuthToken(req);
  if (accessToken == null) {
    return res.status(401).json({
      error:
        'Request header "Authentication" does not exist or does not contain authentication token.',
    });
  }
  try {
    req.verifyResult = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Access token is invalid" });
  }
  next();
}
async function getUserMiddleware(req, res, next) {
  let username = req.verifyResult.username;
  let user = await db.Profiles.findByPk(username);
  if (user == null) {
    return res
      .status(400)
      .json({ error: `Username ${username} does not exist` });
  }
  req.user = user;
  next();
}
module.exports = { getAuthToken, authUserMiddleware, getUserMiddleware };
