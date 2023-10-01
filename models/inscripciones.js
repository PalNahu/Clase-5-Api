'use strict';
module.exports = (sequelize, DataTypes) => {
  const inscripciones = sequelize.define('inscripciones', {
    id_materia: DataTypes.INTEGER,
    id_alumno: DataTypes.INTEGER
  }, {});
  inscripciones.associate = function(models) {
    //asociacion a alumnos (pertenece a:)
  	inscripciones.belongsTo(models.alumnos// modelo al que pertenece
    ,{
      as : 'inscripcion-alumno',  // nombre de mi relacion
      foreignKey: 'id_alumno'     // campo con el que voy a igualar
    }),
    inscripciones.belongsTo(models.materia// modelo al que pertenece
    ,{
      as : 'inscripcion-materia',  // nombre de mi relacion
      foreignKey: 'id_materia'     // campo con el que voy a igualar
    })

  	/////////////////////

  };
  return inscripciones;
};

