var jwt = require("jsonwebtoken");
var config = require("../config");

function getAuthToken(req) {
  let authHeader = req.get("Authorization");
  return authHeader && authHeader.split(" ")[1];
}
function authUserMiddleware(req, res, next) {
  let accessToken = getAuthToken(req);
  if (accessToken == null) {
    return res.status(403).json({
      error:
        'Request header "Authentication" does not exist or does not contain authentication token.',
    });
  }
  try {
    req.verifyResult = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
    console.log(req.verifyResult);
  } catch (err) {
    return res.status(403).json({ error: "Access token is invalid" });
  }
  next();
}

function pagination(totalItems, page, res) {
  if (isNaN(parseInt(page))) {
    return res.status(400).json({ error: `Page must be an integer` });
  }
  if (page < 1){
    return res.status(400).json({ error: `Page must be larger than 0` });
  }
  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit);
  if (page > totalPages) {
    return res.status(400).json({ error: `Total pages are ${totalPages}` });
  }
  const offset = (page - 1) * limit;
  return { limit, offset, totalPages };
}

module.exports = { getAuthToken, authUserMiddleware, pagination };
