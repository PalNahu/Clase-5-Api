const models = require('../models');

const getInscripciones = (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10; // Cantidad de elementos por página (predeterminado: 10)
  const page = parseInt(req.query.page) || 1; // Página actual (predeterminado: 1)

  const offset = (page - 1) * limit;

  models.inscripcion
    .findAndCountAll({
      attributes: ["id", "id_alumno", "id_materia"],
      include: [
        { as: 'Inscripcion-Alumno-Relacion', model: models.alumno, attributes: ["id", "nombre", "apellido"] },
        { as: 'Inscripcion-Materia-Relacion', model: models.materia, attributes: ["id", "nombre"] }
      ],
      offset: offset,
      limit: limit,
      subQuery: false,
    })
    .then((result) => {
      const inscripciones = result.rows;
      const totalRecords = result.count;
      const totalPages = Math.ceil(totalRecords / limit);

      res.send({
        inscripciones,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
        },
      });
    })
    .catch((error) => {
      return next(error);
    });
};

const createInscripcion = (req, res) => {
  models.inscripcion
    .create({ id_alumno: req.body.id_alumno, id_materia: req.body.id_materia })
    .then((inscripcion) => res.status(201).send({ id: inscripcion.id }))
    .catch((error) => {
      if (error === 'SequelizeUniqueConstraintError: Validation error') {
        res
          .status(400)
          .send('Bad request: existe otra inscripcion con el mismo nombre');
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
};

const findInscripcion = (id, { onSuccess, onNotFound, onError }) => {
  models.inscripcion
    .findOne({
      attributes: ['id', 'id_alumno', 'id_materia'],
      where: { id },
    })
    .then((inscripcion) => (inscripcion ? onSuccess(inscripcion) : onNotFound()))
    .catch(() => onError());
};

const getInscripcion = (req, res) => {
  findInscripcion(req.params.id, {
    onSuccess: (inscripcion) => res.send(inscripcion),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
};

const putInscripcion = (req, res) => {
  const { id_alumno, id_materia } = req.body;
  const update = {};
  if (id_alumno) update.id_alumno = id_alumno;
  if (id_materia) update.id_materia = id_materia;
  const onSuccess = (inscripcion) =>
    inscripcion
      .update(update)
      .then(() => res.sendStatus(200))
      .catch((error) => {
        if (error === 'SequelizeUniqueConstraintError: Validation error') {
          res
            .status(400)
            .send('Bad request: existe otra inscipcion con el mismo Alumno y Materia');
        } else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`);
          res.sendStatus(500);
        }
      });
  findInscripcion(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
};

const deleteInscripcion = (req, res) => {
  const onSuccess = (inscripcion) =>
    inscripcion
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findInscripcion(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
};

module.exports = {
  getInscripcion,
  getInscripciones,
  createInscripcion,
  putInscripcion,
  deleteInscripcion,
};
