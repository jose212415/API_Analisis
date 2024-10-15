const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const travelResolvers = {
    Query: {
        // Obtener todos los viajes
        travels: async () => {
            const res = await pool.query('SELECT * FROM "Travels"');
        return res.rows;
        },
        // Obtener un viaje por ID
        travel: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Travels" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar un nuevo viaje, solo si el usuario tiene el rol "admin"
        createTravel: async (parent, args, context) => {
            // Verificar si el usuario tiene un token válido y es admin
            if (!context.user || context.user.rol !== 'admin') {
                throw new Error('No autorizado, solo los administradores pueden agregar viajes.');
            }

            const { Name, DateStart, HourStart, DateEnd, HourEnd, Description, Price } = args;

            const res = await pool.query(
                `INSERT INTO public."Travels"("Name", "DateStart", "HourStart", "DateEnd", "HourEnd", "Description", "Price")
                 VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [Name, DateStart, HourStart, DateEnd, HourEnd, Description, Price]
            );

            const travel = res.rows[0];
            return {
                message: 'Viaje agregado exitosamente',
                travel
            };
        },
    },
};

module.exports = travelResolvers;