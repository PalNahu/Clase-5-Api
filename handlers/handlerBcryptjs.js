const bcrypt = require('bcryptjs');

//Encriptacion 
const encrypt = async (textPlain)=>{
    const hash = await bcrypt.hash(textPlain, 10)

    return hash

};

//Comparacion
const compare = async(passwordPlain, hashPassword) =>{
    return await bcrypt.compare(passwordPlain, hashPassword)
};

module.exports= {encrypt, compare};