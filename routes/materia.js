var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  models.materia
    .findAll({
      attributes: ["id", "nombre", "id_carrera"]
    })
    .then(materias => res.send(materias))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.materia
    .create({ nombre: req.body.nombre, id_carrera: req.body.id_carrera })
    .then(materia => res.status(201).send({ id: materia.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: ya existe una materia con el mismo nombre en la misma carrera')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

router.get("/:id", (req, res) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre", "id_carrera"],
      where: { id: req.params.id }
    })
    .then(materia => {
      if (materia) {
        res.send(materia);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(() => res.sendStatus(500));
});

router.put("/:id", (req, res) => {
  models.materia.findOne({ where: { id: req.params.id } })
    .then(materia => {
      if (materia) {
        return materia.update({ nombre: req.body.nombre, id_carrera: req.body.id_carrera }, { fields: ["nombre", "id_carrera"] });
      } else {
        res.sendStatus(404);
      }
    })
    .then(() => res.sendStatus(200))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: ya existe una materia con el mismo nombre en la misma carrera')
      }
      else {
        console.log(`Error al intentar actualizar la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

router.delete("/:id", (req, res) => {
  models.materia
    .findOne({ where: { id: req.params.id } })
    .then(materia => {
      if (materia) {
        return materia.destroy();
      } else {
        res.sendStatus(404);
      }
    })
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

module.exports = router;
