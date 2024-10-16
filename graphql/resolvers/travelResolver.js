const pool = require('../../db/pool'); // Ruta a la configuración de la BD

function formatDateToISO(dateString) {
    // Suponiendo que el formato de entrada es DD/MM/YYYY
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;  // Retornar en formato YYYY-MM-DD
}

const travelResolvers = {
    Query: {
        // Obtener todos los viajes
        travels: async (parent, { limit, offset }) => {
            const res = await pool.query('SELECT * FROM "Travels" LIMIT $1 OFFSET $2', [limit, offset]);
        return res.rows;
        },
        // Obtener un viaje por ID
        travel: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Travels" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
         // Obtener todos los viajes asociados a una categoría de lugar
        travelCategory: async (parent, args) => {
            const res = await pool.query(`
                SELECT 
                    t."Id" as "TravelId",
                    t."Name" as "TravelName",
                    t."DateStart",
                    t."DateEnd",

                    p."Id" as "PlaceId",
                    p."Name" as "PlaceName",
                    p."Description" as "PlaceDescription",

                    pc."Name" as "CategoryName"
                FROM public."TravelPlaces" tp
                JOIN public."Travels" t ON tp."TravelId" = t."Id"
                JOIN public."Places" p ON tp."PlaceId" = p."Id"
                JOIN public."PlaceCategories" pc ON p."PlaceCategoryId" = pc."Id"
                WHERE pc."Id" = $1
            `, [args.CategoryId]);

            return res.rows.map(row => ({
                travelPlace: {
                    TravelId: row.TravelId,
                    PlaceId: row.PlaceId
                },
                travel: {
                    Id: row.TravelId,
                    Name: row.TravelName,
                    DateStart: row.DateStart,
                    DateEnd: row.DateEnd
                },
                place: {
                    Id: row.PlaceId,
                    Name: row.PlaceName,
                    Description: row.PlaceDescription
                }
            }));
        },
        // Obtener todos los viajes realizados
        travelsCompleted: async () => {
            const res = await pool.query('SELECT * FROM "Travels" WHERE "DateEnd" < NOW();');
        return res.rows;
        },
        // Obtener viaje por nombre
        travelByName: async (parent, args) => {
            const res = await pool.query(`
                SELECT * FROM public."Travels" WHERE "Name" ILIKE '%' || $1 || '%';
            `, [args.Name]);
            return res.rows;
        },
        // Obtener viajes por rango de fechas
        travelByDateRange: async (parent, args) => {
            // Convertir fechas a formato YYYY-MM-DD
            const startDateFormatted = formatDateToISO(args.StartDate); // Convertir fecha de inicio
            const endDateFormatted = formatDateToISO(args.EndDate);     // Convertir fecha de fin

            const res = await pool.query(`
                SELECT * FROM public."Travels"
                WHERE "DateStart" >= $1 AND "DateEnd" <= $2;
            `, [startDateFormatted , endDateFormatted]);
            return res.rows;
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