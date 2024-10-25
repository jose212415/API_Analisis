const pool = require('../../db/pool'); // Ruta a la configuración de la BD

function formatDateToISO(dateString) {
    // Suponiendo que el formato de entrada es DD/MM/YYYY
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;  // Retornar en formato YYYY-MM-DD
}

function formateDate(dateOrigin) {
    if (dateOrigin) {
        const dateFormated = new Date(dateOrigin);

        // Verificar si la fecha es válida
        if (!isNaN(dateFormated)) {
            // Extraer los componentes de la fecha
            const day = String(dateFormated.getDate()).padStart(2, '0');
            const month = String(dateFormated.getMonth() + 1).padStart(2, '0'); // Los meses son 0 indexados
            const year = dateFormated.getFullYear();

            // Formatear la fecha como MM-DD-YYYY
            return `${day}-${month}-${year}`;
        } else {
            return null; // Si la fecha es inválida
        }
    }
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
            const travel = res.rows[0];

            travel.DateStart = formateDate(travel.DateStart);
            travel.DateEnd = formateDate(travel.DateEnd);

            // Consultar los travelPlaces relacionados, incluyendo Places, City, PlaceCategory y Country
            const travelPlacesRes = await pool.query(`
                SELECT 
                    tp."Id" AS "TravelPlaceId", tp."TravelId", tp."PlaceId", tp."active" AS "TravelPlaceActive",
                    p."Id" AS "PlaceId", p."Name" AS "PlaceName", p."Description" AS "PlaceDescription", 
                    p."CityId", p."PlaceCategoryId", p."active" AS "PlaceActive",
                    c."Id" AS "CityId", c."Name" AS "CityName", c."Description" AS "CityDescription", c."CountryId", c."active" AS "CityActive",
                    pc."Id" AS "CategoryId", pc."Name" AS "CategoryName", pc."active" AS "CategoryActive",
                    co."Id" AS "CountryId", co."Name" AS "CountryName", co."active" AS "CountryActive"
                FROM "TravelPlaces" tp
                JOIN "Places" p ON tp."PlaceId" = p."Id"
                JOIN "Cities" c ON p."CityId" = c."Id"
                LEFT JOIN "PlaceCategories" pc ON p."PlaceCategoryId" = pc."Id"
                LEFT JOIN "Countries" co ON c."CountryId" = co."Id"
                WHERE tp."TravelId" = $1
            `, [args.Id]);

            // Formatear el resultado para incluir las relaciones
            travel.travelPlaces = travelPlacesRes.rows.map(row => ({
                Id: row.TravelPlaceId,
                TravelId: row.TravelId,
                PlaceId: row.PlaceId,
                active: row.TravelPlaceActive,
                place: {
                    Id: row.PlaceId,
                    Name: row.PlaceName,
                    Description: row.PlaceDescription,
                    active: row.PlaceActive,
                    CityId: row.CityId,  // Verificación de que se está devolviendo el CityId
                    PlaceCategoryId: row.PlaceCategoryId,  // Verificación del PlaceCategoryId
                    city: {
                        Id: row.CityId,
                        Name: row.CityName,
                        Description: row.CityDescription,
                        active: row.CityActive,
                        country: {
                            Id: row.CountryId,
                            Name: row.CountryName,
                            active: row.CountryActive
                        }
                    },
                    placeCategory: {
                        Id: row.CategoryId,
                        Name: row.CategoryName,
                        active: row.CategoryActive
                    }
                }
            }));

            // Consultar las imágenes de TravelImages relacionadas
            const travelImagesRes = await pool.query(`
                SELECT * FROM "TravelImages" WHERE "TravelId" = $1
            `, [args.Id]);
            travel.travelImages = travelImagesRes.rows;

            // Consultar las actividades de ActivityTravelPlace relacionadas
            const activityTravelPlacesRes = await pool.query(`
                SELECT * FROM "ActivityTravelPlace" WHERE "TravelPlaceId" IN (
                    SELECT "Id" FROM "TravelPlaces" WHERE "TravelId" = $1
                )
            `, [args.Id]);
            // Iterar sobre las filas devueltas y formatear el campo Date
            travel.activityTravelPlaces = activityTravelPlacesRes.rows.map(row => {
                // Convertir el timestamp a Date y luego formatearlo
                console.log(row.Date);
                const formattedDate = row.Date ? formateDate(row.Date, 10) : null;
                
                return {
                    ...row,
                    Date: formattedDate // Aplicar el valor formateado
                };
            });
            travel.activityTravelPlaces = activityTravelPlacesRes.rows;

            return travel;
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