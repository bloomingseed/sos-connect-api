const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const { PORT } = require("./config");
const routers = require("./routers");
const fs = require("fs");
const prefix = "/api";

const swaggerJsDoc = require("swagger-jsdoc");
const apiSpec = swaggerJsDoc(require("./config/swagger"));
fs.writeFileSync("./public/swagger.json", JSON.stringify(apiSpec));

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, //2MB max file(s) size
    },
  })
);
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
routers.forEach((router) => app.use(`${prefix}/${router.name}`, router.router));

app.listen(PORT, () => {
  console.log(`Example app listening at port: ${PORT}`);
});
