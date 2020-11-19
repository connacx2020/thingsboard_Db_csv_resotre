// const csv = require('csv-parser');
const fs = require('fs');
const moment = require('moment');

require('dotenv').config();
const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});


function deleteFromDB(date1, date2) {
    pool.query(`
    delete from ts_kv where TO_TIMESTAMP(TRUNC(ts/1000)) >= '${date1} 00:00:00' AND TO_TIMESTAMP(TRUNC(ts/1000))  <= '${date2} 23:59:59';
    `)
}

deleteFromDB(process.argv[2], process.argv[3]);