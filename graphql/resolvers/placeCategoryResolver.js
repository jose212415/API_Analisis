const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const placeCategoryResolvers = {
    Query: {
        // Obtener todas las categorias de lugares
        placeCategories: async () => {
            const res = await pool.query('SELECT * FROM "PlaceCategories"');
        return res.rows;
        },
        // Obtener una categoria de lugar por ID
        placeCategory: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "PlaceCategories" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar una nueva categoria lugar, solo si el usuario tiene el rol "admin"
        createPlaceCategory: async (parent, args, context) => {
            // Verificar si el usuario tiene un token válido y es admin
            if (!context.user || context.user.rol !== 'admin') {
                throw new Error('No autorizado, solo los administradores pueden agregar categorias de lugares.');
            }

            const { Name } = args;

            const res = await pool.query(
                `INSERT INTO public."PlaceCategories"("Name")
                 VALUES($1) RETURNING *`,
                [Name]
            );

            const placeCategory = res.rows[0];
            return {
                message: 'Categoria de lugar agregada exitosamente',
                placeCategory
            };
        },
    },
};

module.exports = placeCategoryResolvers;