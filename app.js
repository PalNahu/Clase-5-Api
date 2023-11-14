var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var carrerasRouter = require('./routes/carreras');
var materiaRouter = require('./routes/materia');
var alumnosRouter = require('./routes/alumnos');
var inscripcionesRouter = require('./routes/inscripciones');
var app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./settings/swagger-config"); 
const PORT = process.env.PORT || 3001;
const mysql = require('mysql2/promise');
var requestIp = require('request-ip');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Login setup
app.use(requestIp.mw());

const dbConfig ={
  host: 'localhost',
  user: 'usuariosuper',
  password: '12344',
  database: 'api_v1',
};

app.use(async(req, res, next) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const ip = req.clientIp; 

      await connection.execute('INSERT INTO auditoria (ip) VALUES (?)' , [ip]);

    await connection.end();
    next();
  } catch (error) {
    console.error('Error al loguear la petición', error);
    next(error);
  }
});


//Login setup

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/car', carrerasRouter);
app.use('/mat', materiaRouter);
app.use('/alu', alumnosRouter);
app.use('/ins', inscripcionesRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
