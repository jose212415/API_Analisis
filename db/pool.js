const { Pool } = require('pg');

//Conexion a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'DB_Viajes',
    password: '1234',
    port: 5432,
});

module.exports = pool;