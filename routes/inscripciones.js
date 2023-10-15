var express = require("express");
var router = express.Router();
var models = require("../models");

/**
 * @swagger
 * components:
 *   schemas:
 *     Inscripcion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         inscripcion-materia:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *         inscripcion-alumno:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             apellido:
 *               type: string
 */

/**
 * @swagger
 * /inscripciones:
 *   get:
 *     summary: Obtiene todas las inscripciones
 *     responses:
 *       200:
 *         description: Lista de inscripciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Inscripcion"
 */

/**
 * @swagger
 * /inscripciones:
 *   post:
 *     summary: Crea una nueva inscripción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Inscripcion"
 *     responses:
 *       201:
 *         description: Inscripción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Inscripcion"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Error en el servidor

 * @swagger
 * /inscripciones/{id}:
 *   get:
 *     summary: Obtiene una inscripción por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la inscripción
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inscripción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Inscripcion"
 *       404:
 *         description: Inscripción no encontrada
 *       500:
 *         description: Error en el servidor

 *   put:
 *     summary: Actualiza una inscripción por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la inscripción
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Inscripcion"
 *     responses:
 *       200:
 *         description: Inscripción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Inscripcion"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Error en el servidor

 *   delete:
 *     summary: Elimina una inscripción por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la inscripción
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inscripción eliminada exitosamente
 *       404:
 *         description: Inscripción no encontrada
 *       500:
 *         description: Error en el servidor
 */

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