const { Pool } = require('pg');

//Conexion a PostgreSQL
const pool = new Pool({
    /*user: 'postgres',
    host: 'postgres.railway.internal',
    database: 'DB_Viajes',
    password: 'wuLwhGPipNOGIWykSZJUIyCmsvFmQYMM',
    port: 5432,*/
    connectionString: 'postgresql://postgres:wuLwhGPipNOGIWykSZJUIyCmsvFmQYMM@junction.proxy.rlwy.net:37969/railway',
});

module.exports = pool;
