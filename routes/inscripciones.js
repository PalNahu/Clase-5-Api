var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Cantidad de elementos por página (predeterminado: 10)
    const page = parseInt(req.query.page) || 1; // Página actual (predeterminado: 1)
    const offset = (page - 1) * limit;

    const { count, rows: inscripciones } = await models.inscripciones.findAndCountAll({
      attributes: ["id"],
      include: [
        {
          model: models.materia,
          as: "inscripcion-materia",
          attributes: ["id", "nombre"],
        },
        {
          model: models.alumnos,
          as: "inscripcion-alumno",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
      offset: offset,
      limit: limit,
    });

    const totalPages = Math.ceil(count / limit);

    res.send({
      inscripciones,
      pagination: {
        page,
        limit,
        totalRecords: count,
        totalPages,
      },
    });
  } catch (error) {
    console.error(`Error al obtener las inscripciones: ${error}`);
    res.sendStatus(500);
  }
});


router.post("/", (req, res) => {
  console.log(req);
  models.inscripciones
    .create({ id_materia: req.body.id_materia, id_alumno: req.body.id_alumno })
    .then(inscripcion => res.status(201).send({ id: inscripcion.id }))
    .catch(error => {
      if (error.name === "SequelizeUniqueConstraintError") {
        res.status(400).send('Bad request: Ya existe una inscripción con el mismo id_materia e id_alumno')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findInscripcion = (id, { onSuccess, onNotFound, onError }) => {
  models.inscripciones
    .findOne({
      attributes: ["id", "id_materia", "id_alumno"],
      where: { id }
    })
    .then(inscripcion => (inscripcion ? onSuccess(inscripcion) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findInscripcion(req.params.id, {
    onSuccess: inscripcion => res.send(inscripcion),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = inscripcion =>
    inscripcion
      .update({ id_materia: req.body.id_materia, id_alumno: req.body.id_alumno }, { fields: ["id_materia", "id_alumno"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error.name === "SequelizeUniqueConstraintError") {
          res.status(400).send('Bad request: Ya existe una inscripción con el mismo id_materia e id_alumno')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
  findInscripcion(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = inscripcion =>
    inscripcion
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findInscripcion(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;