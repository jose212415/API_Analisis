const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool'); // Ruta a la configuración de la BD
const { SECRET_KEY } = require('../utils/auth');

const userResolvers = require('./resolvers/userResolver');
const travelResolvers = require('./resolvers/travelResolver');
const countryResolvers = require('./resolvers/countryResolver');
const cityResolvers = require('./resolvers/cityResolver');
const placeCategoryResolvers = require('./resolvers/placeCategoryResolver');
const placeResolvers = require('./resolvers/placeResolver');
const travelPlaceResolvers = require('./resolvers/travelPlacesResolver');
const typePaymentResolver = require('./resolvers/typePaymentResolver');
const paymentResolver = require('./resolvers/paymentResolver');
const paymentTravelUserResolvers = require('./resolvers/paymentTravelUser');
const imageUploadResolvers = require('./resolvers/imageUploadResolver');

// Resolvers 
const resolvers = {
    Query: {
        // Obtener todas las actividades
        activities: async () => {
            const res = await pool.query('SELECT * FROM "Activity"');
            return res.rows;
        },
        // Obtener una actividad por ID
        activity: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Activity" WHERE "Id" = $1', [args.Id]);
            return res.rows[0];
        },
        ...userResolvers.Query,
        ...travelResolvers.Query,
        ...countryResolvers.Query,
        ...cityResolvers.Query,
        ...placeCategoryResolvers.Query,
        ...placeResolvers.Query,
        ...travelPlaceResolvers.Query,
        ...typePaymentResolver.Query,
        ...paymentResolver.Query,
        ...paymentTravelUserResolvers.Query,
    },
    Mutation: {
        login: async (parent, { Email, Password }) => {
            // Verificar si el email existe en la base de datos
            const userCheck = await pool.query('SELECT * FROM "Users" WHERE "Email" = $1', [Email]);

            if (userCheck.rows.length === 0) {
                throw new Error('Correo electrónico no encontrado');
            }

            const user = userCheck.rows[0];

            // Verificar la contraseña cifrada
            const isPasswordValid = await bcrypt.compare(Password, user.Password);
            if (!isPasswordValid) {
                throw new Error('Contraseña incorrecta');
            }

            // Generar un token JWT
            const token = jwt.sign(
                {
                userId: user.Id,
                email: user.Email,
                rol: user.Rol
                },
                SECRET_KEY,
                { expiresIn: '1y' } // Token expira en 2 horas
            );

            // Si el email y la contraseña coinciden, devolver el usuario
            return {
                message: 'Inicio de sesión exitoso',
                token,
                user
            };
        },
        ...userResolvers.Mutation,
        ...travelResolvers.Mutation,
        ...countryResolvers.Mutation,
        ...cityResolvers.Mutation,
        ...placeCategoryResolvers.Mutation,
        ...placeResolvers.Mutation,
        ...travelPlaceResolvers.Mutation,
        ...typePaymentResolver.Mutation,
        ...paymentResolver.Mutation,
        ...paymentTravelUserResolvers.Mutation,
        ...imageUploadResolvers.Mutation,
    },

};

module.exports = resolvers;