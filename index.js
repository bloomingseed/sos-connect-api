const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const routers = require("./routers");

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const apiSpec = swaggerJsDoc(require("./config/swagger"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(apiSpec));
app.use(express.json());
// console.log(routers);
routers.forEach((router) => app.use(`/${router.name}`, router.router));

app.listen(port, () => {
  console.log(`Example app listening at port: ${port}`)
})
