'use strict';
module.exports = (sequelize, DataTypes) => {
  const usuarios = sequelize.define('usuarios', {
    email: DataTypes.STRING,
    password: DataTypes.INTEGER
  }, {});
  usuarios.associate = function(models) {
    // associations can be defined here
  };
  return usuarios;
};