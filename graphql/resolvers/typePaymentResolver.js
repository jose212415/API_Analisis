const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const typePaymentResolvers = {
    Query: {
        // Obtener todos tipos de pagos
        typePayments: async () => {
            const res = await pool.query('SELECT * FROM "Typepayments"');
        return res.rows;
        },
        // Obtener un tipo de pago por id
        typePayment: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Typepayments" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar un nuevo tipo de pago, solo si el usuario tiene el rol "admin"
        createTypePayment: async (parent, args, context) => {
            // Verificar si el usuario tiene un token válido y es admin
            if (!context.user || context.user.rol !== 'admin') {
                throw new Error('No autorizado, solo los administradores pueden agregar categorias de lugares.');
            }

            const { Name, Surcharge } = args;

            const res = await pool.query(
                `INSERT INTO public."Typepayments"("Name", "Surcharge")
                 VALUES($1, $2) RETURNING *`,
                [Name, Surcharge,]
            );

            const typePayment = res.rows[0];
            return {
                message: 'Tipo de Pago agregado exitosamente',
                typePayment
            };
        },
    },
};

module.exports = typePaymentResolvers