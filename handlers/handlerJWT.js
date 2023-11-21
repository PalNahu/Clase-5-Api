const jwt = require("jsonwebtoken");

const jwtconfig ={
    secretKey: 'EstrategiasPersistencia2023SegundoCuatrimestre',
    expiresIn: '1h'
}

function generateToken(userId){
    return jwt.sign({userId}, jwtconfig.secretKey, {
        expiresIn: jwtconfig.expiresIn
    });
};

function verifyToken(token){
    try{
        const decoded = jwt.verify(token, jwtconfig.secretKey);
        return decoded;
    }catch(error){
        console.log(error);
    }
}

module.exports = {generateToken, verifyToken};