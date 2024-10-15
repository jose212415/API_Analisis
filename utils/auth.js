const jwt = require('jsonwebtoken');

const SECRET_KEY = 'besttravelsystem';

// Definir la función para obtener el usuario desde el token JWT
const getUserFromToken = (token) => {
    try {
        if (token) {
        return jwt.verify(token, SECRET_KEY); // Decodificar el token con la clave secreta
        }
        return null;
    } catch (error) {
        return null; 
    }
};

module.exports = {
    SECRET_KEY,
    getUserFromToken
};