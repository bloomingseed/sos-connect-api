var express = require("express");
var uploadRouter = express.Router();
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

function uploadImage(image, req) {
  image.mv("public/uploads" + image.name);
  let url = `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(
    image.name
  )}`;
  return url;
}

async function uploadImageHandler(req, res) {
  let imgFile = req.files.image;
  if (imgFile == null)
    return res
      .status(400)
      .json({ error: "File to be uploaded not found, expected key: image" });

  if (!ACCEPTED_IMAGE_TYPES.includes(imgFile.mimetype))
    return res.status(400).json({
      error: `Invalid image type. Supported image types are ${ACCEPTED_IMAGE_TYPES.join(
        ", "
      )}.`,
    });
  let payload = { url: uploadImage(imgFile, req) };

  return res.status(200).json(payload);
}

uploadRouter.route("/").post(uploadImageHandler);

module.exports = { router: uploadRouter, name: "upload" };
