var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.alumnos
    .findAll({
      attributes: ["id", "nombre", "apellido"]
    })
    .then(alumnos => res.send(alumnos))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  console.log(req);
  models.alumnos
    .create({ nombre: req.body.nombre, apellido: req.body.apellido })
    .then(alumno => res.status(201).send({ id: alumno.id }))
    .catch(error => {
      if (error.name === "SequelizeUniqueConstraintError") {
        res.status(400).send('Bad request: Ya existe otro alumno con el mismo nombre y apellido')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumnos
    .findOne({
      attributes: ["id", "nombre", "apellido"],
      where: { id }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .update({ nombre: req.body.nombre, apellido: req.body.apellido }, { fields: ["nombre", "apellido"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error.name === "SequelizeUniqueConstraintError") {
          res.status(400).send('Bad request: Ya existe otro alumno con el mismo nombre y apellido')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
