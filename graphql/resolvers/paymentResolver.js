const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const paymentResolvers = {
    Query: {
        // Obtener todos los pagos
        payments: async () => {
            const res = await pool.query('SELECT * FROM "Payments"');
        return res.rows;
        },
        // Obtener un pago por id
        payment: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Payments" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar un nuevo pago
        createPayment: async (parent, args) => {

            const { ProofPayment, Date, Time, Discount, TypeId, Approved } = args;

            const res = await pool.query(
                `INSERT INTO public."Payments"("ProofPayment", "Date", "Time", "Discount", "TypeId", "Approved")
                 VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
                [ProofPayment, Date, Time, Discount, TypeId, Approved]
            );

            const payment = res.rows[0];
            return {
                message: 'Pago agregado exitosamente',
                payment
            };
        },
    },
};

module.exports = paymentResolvers