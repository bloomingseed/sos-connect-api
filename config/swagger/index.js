const config = require("../index");
function getServerUrl() {
  return (
    config.HOSTNAME ||
    `http://localhost:${config.HOST_APP_PORT || config.APP_PORT}`
  );
}
module.exports = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Specification",
      version: "1.0.0",
      description: "The API specification for SOS Connect API service.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: getServerUrl(),
      },
    ],
  },
  apis: ["routers/*.js", "config/swagger/*.js"],
};
