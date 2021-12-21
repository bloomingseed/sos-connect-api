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
function isValidWebUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function validateImagesParamMiddleware(req, res, next) {
  if (req.body.images == null) req.body.images = [];
  for (let image of req.body.images) {
    if (typeof image != "object" || image.url == undefined) {
      return res
        .status(400)
        .json({ error: `"images" field must contain object with key "url"` });
    } else if (!isValidWebUrl(image.url))
      return res
        .status(400)
        .json({ error: `"${image.url}" is not a valid web URL` });
  }
  next();
}

module.exports = {
  getAuthToken,
  authUserMiddleware,
  validateImagesParamMiddleware,
};
