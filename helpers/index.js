var jwt = require("jsonwebtoken");
var config = require("../config");

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
    jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Access token is invalid" });
  }
  next();
}
module.exports = { getAuthToken, authUserMiddleware };
