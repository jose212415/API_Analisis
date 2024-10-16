/*paymentsByUser: async (parent, args) => {
    const res = await pool.query(`
        SELECT * FROM public."Payments" WHERE "UserId" = $1;
    `, [args.UserId]);
    return res.rows;
},*/
const pool = require('../../db/pool'); // Ruta a la configuración de la BD

const paymentTravelUserResolvers = {
    Query: {
        // Obtener todos los pagos viajes usuarios
        paymentsTravelUser: async () => {
            const res = await pool.query('SELECT * FROM "PaymentTravelUser"');
        return res.rows;
        },
        // Obtener un pago viaje usuario por id
        paymentTravelUser: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "PaymentTravelUser" WHERE "Id" = $1', [args.Id]);
        return res.rows[0];
        },
    },

    Mutation: {
        // Insertar un nuevo pago viaje usuario
        createPaymentTravelUser: async (parent, args) => {

            const { TravelId, UserId, PaymentId } = args;

            const res = await pool.query(
                `INSERT INTO public."PaymentTravelUser"("TravelId", "UserId", "PaymentId")
                 VALUES($1, $2, $3) RETURNING *`,
                [TravelId, UserId, PaymentId]
            );

            const paymentTravelUser = res.rows[0];
            return {
                message: 'Pago Viaje Usuario agregado exitosamente',
                paymentTravelUser
            };
        },
    },
};

module.exports = paymentTravelUserResolvers