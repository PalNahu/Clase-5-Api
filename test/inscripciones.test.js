const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); 

const expect = chai.expect;

chai.use(chaiHttp);

describe('Inscripciones API', () => {
  // Prueba GET /inscripciones
  it('Debería obtener todas las inscripciones', (done) => {
    chai.request(app)
      .get('/ins') 
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  // Prueba POST /inscripciones
  it('Debería crear una nueva inscripción', (done) => {
    const nuevaInscripcion = {
      id_materia: 1,
      id_alumno: 2,
    };
    chai.request(app)
      .post('/ins') 
      .send(nuevaInscripcion)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  // Prueba GET /inscripciones/{id}
  it('Debería obtener una inscripción por su ID', (done) => {
    const inscripcionId = 2; 
    chai.request(app)
      .get(`/ins/${inscripcionId}`) 
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  // Prueba PUT /inscripciones/{id}
  it('Debería actualizar una inscripción por su ID', (done) => {
    const inscripcionId = 2; 
    const inscripcionActualizada = {
      id_materia: 2,
      id_alumno: 2,
    };
    chai.request(app)
      .put(`/ins/${inscripcionId}`) 
      .send(inscripcionActualizada)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  // Prueba DELETE /inscripciones/{id}
  it('Debería eliminar una inscripción por su ID', (done) => {
    const inscripcionId = 22; 
    chai.request(app)
      .delete(`/ins/${inscripcionId}`) 
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
