const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool'); // Ruta a la configuración de la BD
const { SECRET_KEY } = require('../utils/auth');

const travelResolvers = require('./resolvers/travelResolver');
const countryResolvers = require('./resolvers/countryResolver');
const cityResolvers = require('./resolvers/cityResolver');
const placeCategoryResolvers = require('./resolvers/placeCategoryResolver');
const placeResolvers = require('./resolvers/placeResolver');

// Resolvers 
const resolvers = {
    Query: {
        // Obtener todas las actividades
        activities: async () => {
            const res = await pool.query('SELECT * FROM "Activity"');
            return res.rows;
        },
        // Obtener todos los usuarios
        users: async () => {
            const res = await pool.query('SELECT * FROM "Users"');
            return res.rows;
        },
        // Obtener una actividad por ID
        activity: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Activity" WHERE "Id" = $1', [args.Id]);
            return res.rows[0];
        },
        // Obtener un usuario por ID
        user: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Users" WHERE "Id" = $1', [args.Id]);
            return res.rows[0];
        },
        ...travelResolvers.Query,
        ...countryResolvers.Query,
        ...cityResolvers.Query,
        ...placeCategoryResolvers.Query,
        ...placeResolvers.Query,
    },
    Mutation: {
        createUser: async (parent, args) => {
            const {
            NameUsers,
            LastName,
            Email,
            Password,
            Phone,
            Rol,
            Address,
            Birthdate,
            Image,
            active
            } = args;

             // Verificar si el email ya existe
            const checkEmail = await pool.query('SELECT * FROM "Users" WHERE "Email" = $1', [Email]);

            if (checkEmail.rows.length > 0) {
                // Si ya existe un usuario con ese email, lanzamos un error
                throw new Error('El correo electrónico ya está registrado.');
            }

            // Cifrar la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(Password, 10);

            const res = await pool.query(
            `INSERT INTO public."Users"(
                "NameUsers", "LastName", "Email", "Password", "Phone", "Rol", "Address", "Birthdate", "Image", active)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [NameUsers, LastName, Email, hashedPassword, Phone, Rol, Address, Birthdate, Image, active]
            );

            const user = res.rows[0];

            return {
                message: 'Registro exitoso',
                user
            };
        },

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
                { expiresIn: '2h' } // Token expira en 2 horas
            );

            // Si el email y la contraseña coinciden, devolver el usuario
            return {
                message: 'Inicio de sesión exitoso',
                token,
                user
            };
        },
        ...travelResolvers.Mutation,
        ...countryResolvers.Mutation,
        ...cityResolvers.Mutation,
        ...placeCategoryResolvers.Mutation,
        ...placeResolvers.Mutation,
    },

};

module.exports = resolvers;