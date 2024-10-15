const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const placeResolvers = {
    Query: {
        // Obtener todos los lugares
        places: async () => {
            const res = await pool.query('SELECT * FROM "Places"');
        return res.rows;
        },
        // Obtener un lugar por ID
        place: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Places" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar un nuevo lugar, solo si el usuario tiene el rol "admin"
        createPlace: async (parent, args, context) => {
            // Verificar si el usuario tiene un token válido y es admin
            if (!context.user || context.user.rol !== 'admin') {
                throw new Error('No autorizado, solo los administradores pueden agregar categorias de lugares.');
            }

            const { Name, Description, CityId, PlaceCategoryId } = args;

            const res = await pool.query(
                `INSERT INTO public."Places"("Name", "Description", "CityId", "PlaceCategoryId")
                 VALUES($1, $2, $3, $4) RETURNING *`,
                [Name, Description, CityId, PlaceCategoryId]
            );

            const place = res.rows[0];
            return {
                message: 'Lugar agregado exitosamente',
                place
            };
        },
    },
};

module.exports = placeResolvers