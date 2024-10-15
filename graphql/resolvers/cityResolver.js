const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const cityResolver = {
    Query: {
        // Obtener todos las ciudades
        cities: async () => {
            const res = await pool.query('SELECT * FROM "Cities"');
        return res.rows;
        },
        // Obtener una ciudad por ID
        city: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Cities" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar una nueva ciudad, solo si el usuario tiene el rol "admin"
        createCity: async (parent, args, context) => {
            // Verificar si el usuario tiene un token válido y es admin
            if (!context.user || context.user.rol !== 'admin') {
                throw new Error('No autorizado, solo los administradores pueden agregar ciudades.');
            }

            const { Name, Description, CountryId } = args;

            const client = await pool.connect(); //Obtener Cliente

            try {
                await client.query('BEGIN'); //Iniciar la Transaccion

                const res = await pool.query(
                    `INSERT INTO public."Cities"("Name", "Description", "CountryId")
                     VALUES($1, $2, $3) RETURNING *`,
                    [Name, Description, CountryId]
                );
    
                const city = res.rows[0];

                await client.query('COMMIT'); //Confirmar la Transaccion

                return {
                    message: 'Ciudad agregada exitosamente',
                    city
                };
            } catch (error) {
                await client.query('ROLLBACK'); //Si ocurre un error hacer un Rollback
                throw new Error('Error al agregar el viaje: ' + error.message);
            } finally {
                client.release(); //Liberar Cliente
            }
        },
    },
};

module.exports = cityResolver;