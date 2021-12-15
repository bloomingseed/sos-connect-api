const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const { PORT } = require("./config");
const routers = require("./routers");

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const apiSpec = swaggerJsDoc(require("./config/swagger"));

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, //2MB max file(s) size
    },
  })
);
app.use(express.static("public"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiSpec));
app.use(cors());
app.use(express.json());
routers.forEach((router) => app.use(`/${router.name}`, router.router));

app.listen(PORT, () => {
  console.log(`Example app listening at port: ${PORT}`);
});
