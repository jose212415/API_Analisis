const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const countryResolver = {
    Query: {
        // Obtener todas las ciudades
        countries: async () => {
            const res = await pool.query('SELECT * FROM "Countries"');
        return res.rows;
        },
        // Obtener una ciudad por ID
        country: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Countries" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar una nueva ciudad, solo si el usuario tiene el rol "admin"
        createCountry: async (parent, args, context) => {
            // Verificar si el usuario tiene un token válido y es admin
            if (!context.user || context.user.rol !== 'admin') {
                throw new Error('No autorizado, solo los administradores pueden agregar paises.');
            }

            const { Name } = args;

            const res = await pool.query(
                `INSERT INTO public."Countries"("Name")
                 VALUES($1) RETURNING *`,
                [Name]
            );

            const country = res.rows[0];
            return {
                message: 'Ciudad agregada exitosamente',
                country
            };
        },
    },
};

module.exports = countryResolver;