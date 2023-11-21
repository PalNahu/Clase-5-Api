'use strict';
module.exports = (sequelize, DataTypes) => {
  const inscripciones = sequelize.define('inscripciones', {
    id_materia: DataTypes.INTEGER,
    id_alumno: DataTypes.INTEGER
  }, {});
  inscripciones.associate = function(models) {
    //asociacion a alumnos (pertenece a:)
  	inscripciones.belongsTo(models.alumnos
    ,{
      as : 'inscripcion-alumno',  
      foreignKey: 'id_alumno'     
    }),
    inscripciones.belongsTo(models.materia
    ,{
      as : 'inscripcion-materia',  
      foreignKey: 'id_materia'     
    })

  	/////////////////////

  };
  return inscripciones;
};

