var express = require("express");
var uploadRouter = express.Router();
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const { HOSTNAME } = require("../config");

function uploadImage(image, req) {
  image.mv("uploads/" + image.name);
  let url = `${HOSTNAME}/uploads/${encodeURIComponent(image.name)}`;
  return url;
}

/**
 * @swagger
 * tags:
 *  - name: Upload
 *    description: Upload image API
 *
 * /api/upload:
 *  post:
 *    summary: Upload an image to server and retrieve the image URL.
 *    tags:
 *      - Upload
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            description: The image to upload (must be a jpg or png image).
 *            type: object
 *            properties:
 *              image:
 *                type: string
 *                format: binary
 *                required: true
 *    responses:
 *      200:
 *        description: Logout successfully
 *        content:
 *          application/json:
 *            schema:
 *              description: Server responds with the encoded image URL.
 *              type: object
 *              properties:
 *                url:
 *                  type: string
 *              example:
 *                url: http://sos-connect.asia/uploads/Screenshot%20from%202021-12-13%2010-31-30.png
 *      400:
 *        description: When request doesn't contain data or data isn't of type jpg or png image.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Response Error Unauthorized"
 */
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
