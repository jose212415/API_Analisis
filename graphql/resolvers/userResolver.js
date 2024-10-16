const pool = require('../../db/pool'); // Ruta a la configuración de la BD
const bcrypt = require('bcrypt');

const userResolvers = {
    Query: {
        // Obtener todos los usuarios
        users: async (parent, { limit, offset }) => {
            const res = await pool.query('SELECT * FROM "Users" LIMIT $1 OFFSET $2', [limit, offset]);
            return res.rows;
        },
        // Obtener un usuario por ID
        user: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Users" WHERE "Id" = $1', [args.Id]);
            return res.rows[0];
        },
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
        // Actualizar Informacion del usurio
        updateUser: async (parent, args) => {
            const {
                Id,
                NameUsers,
                LastName,
                Email,
                Phone,
                Address,
                Birthdate,
                Image,
            } = args;

             // Verificar si el email ya existe
            const checkEmail = await pool.query('SELECT * FROM "Users" WHERE "Email" = $1', [Email]);

            if (checkEmail.rows.length > 0) {
                // Si ya existe un usuario con ese email, lanzamos un error
                throw new Error('El correo electrónico ya está registrado.');
            }

            // Cifrar la contraseña antes de guardarla
            //const hashedPassword = await bcrypt.hash(Password, 10);

            const res = await pool.query(
            `UPDATE public."Users"
                SET "NameUsers" = $1, "LastName" = $2, "Email" = $3, "Phone" = $4, "Address" = $5, "Birthdate" = $6, "Image" = $7
                WHERE "Id" = $8 RETURNING *;`,
            [NameUsers, LastName, Email, Phone, Address, Birthdate, Image, Id]
            );

            const user = res.rows[0];

            return {
                message: 'Usuario actualizado exitosamente',
                user
            };
        },
    },
};

module.exports = userResolvers;