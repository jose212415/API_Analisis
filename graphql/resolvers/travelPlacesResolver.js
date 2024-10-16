const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const travelPlaceResolvers = {
    Query: {
        // Obtener todos los TravelPlaces
        travelPlaces: async () => {
            const res = await pool.query('SELECT * FROM "TravelPlaces"');
        return res.rows;
        },
        // Obtener un registro de TravelPlaces por Travel Id
        travelPlace: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "TravelPlaces" WHERE "TravelId" = $1', [args.Id]);
        return res.rows[0];
        }
    },

    Mutation: {
        // Insertar un TravelPlace, solo si el usuario tiene el rol "admin"
        createTravelPlace: async (parent, args, context) => {
            // Verificar si el usuario tiene un token válido y es admin
            if (!context.user || context.user.rol !== 'admin') {
                throw new Error('No autorizado, solo los administradores pueden agregar viajes.');
            }

            const { TravelId, PlaceId } = args;

            const res = await pool.query(
                `INSERT INTO public."TravelPlaces"("TravelId", "PlaceId")
                 VALUES($1, $2) RETURNING *`,
                [TravelId, PlaceId]
            );

            const travelPlace = res.rows[0];
            return {
                message: 'TravelPlace agregado exitosamente',
                travelPlace
            };
        },
    },
};

module.exports = travelPlaceResolvers;