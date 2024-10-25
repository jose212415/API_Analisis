const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const travelImageResolvers = {
    Query: {
        // Obtener todas las imágenes de viaje
        travelImages: async (parent, { limit, offset }) => {
            const res = await pool.query(
                'SELECT * FROM "TravelImages" LIMIT $1 OFFSET $2',
                [limit || 10, offset || 0] // Valores predeterminados
            );
            return res.rows;
        },

        // Obtener una imagen de viaje por ID
        travelImage: async (parent, { Id }) => {
            const res = await pool.query(
                'SELECT * FROM "TravelImages" WHERE "Id" = $1',
                [Id]
            );
            return res.rows[0];
        },

        // Obtener todas las imágenes de viaje asociadas a un TravelId
        travelImagesByTravelId: async (parent, { TravelId }) => {
            const res = await pool.query(
                'SELECT * FROM "TravelImages" WHERE "TravelId" = $1',
                [TravelId]
            );
            return res.rows;
        },
    },
};

module.exports = travelImageResolvers;