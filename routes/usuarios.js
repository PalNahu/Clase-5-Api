var express = require("express");
var router = express.Router();
var models = require("../models");
const { encrypt, compare } = require("../handlers/handlerBcryptjs");
const { generateToken, verifyToken } = require("../handlers/handlerJWT");

router.get("/", (req, res) => {
    console.log("Esto es un mensaje para ver en consola");
    models.usuarios
        .findAll({
            attributes: ["id", "email", "password"]
        })
        .then(usuarios => res.send(usuarios))
        .catch(() => res.sendStatus(500));
});

const encontrarUsuarioPorId = (id, { onSuccess, onNotFound, onError }) => {
    models.usuarios
        .findOne({
            attributes: ["id", "email"],
            where: { id },
        })
        .then((usuarios) => (usuarios ? onSuccess(usuarios) : onNotFound()))
        .catch(() => onError());
};



router.get("/:id", (req, res) => {
    encontrarUsuarioPorId(req.params.id, {
        onSuccess: usuarios => res.send(usuarios),
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500),
    });
});

const validarUsuario = async (
    email,
    password,
    { onSuccess, onIncorrectCredentials, onError }
) => {
    try {
        let user = await models.usuarios.findOne({
            attributes: ["id", "email", "password"],
            where: { email },
        });
        if (!user) onIncorrectCredentials();

        let checkedPassword = await compare(password, user.password);

        if (checkedPassword) {
            let usuario = {
                id: user.id,
                email: user.email,
                token: generateToken(user.id),
            };
            onSuccess(usuario);
        } else {
            onIncorrectCredentials();
        }
    } catch (error) {
        onError();
    }
};

router.post("/login", (req, res) => {
    validarUsuario(req.body.email, req.body.password, {
        onSuccess: (usuario) => res.send(usuario),
        onIncorrectCredentials: () =>
            res.status(401).send("Credenciales Incorrectas"),
        onError: () => res.sendStatus(500),
    });
});

router.post("/", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Token no encontrado" });
    }

    const decoded = verifyToken(token);
    console.log(decoded);
    if (decoded) {
        console.log(decoded);
        return res.status(401).json({ error: "Token inválido" });

    }


    let { email, password } = req.body;

    password = await encrypt(password);

    models.usuarios
        .create({ email: email, password: password })
        .then(usuarios => res.status(201).send({ id: usuarios.id }))
        .catch(error => {
            if (error.name === "SequelizeUniqueConstraintError") {
                res.status(400).send('Bad request: Ya existe otro usuario con el mismo nombre')
            }
            else {
                console.log(`Error al intentar insertar en la base de datos: ${error}`)
                res.sendStatus(500)
            }
        });
});


router.put("/:id", (req, res) => {
    const onSuccess = (usuarios) =>
        usuarios
            .update({ email: req.body.email, password: req.body.password }, { fields: ["email", "password"] })
            .then(() => res.sendStatus(200))
            .catch(error => {
                if (error.name === "SequelizeUniqueConstraintError") {
                    res.status(400).send('Bad request: Ya existe otro alumno con el mismo nemail')
                }
                else {
                    console.log(`Error al intentar actualizar la base de datos: ${error}`)
                    res.sendStatus(500)
                }
            });
    encontrarUsuarioPorId(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
    });
});

router.delete("/:id", (req, res) => {
    const onSuccess = (usuarios) =>
        usuarios
            .destroy()
            .then(() => res.sendStatus(200))
            .catch(() => res.sendStatus(500));
    encontrarUsuarioPorId(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
    });
});

module.exports = router;
