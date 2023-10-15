const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de Inscripciones",
    version: "1.0.0",
    description: "Documentación de la API de Inscripciones",
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/inscripciones.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;