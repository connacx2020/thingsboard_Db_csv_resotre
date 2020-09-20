require('dotenv').config();
const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
})

// pool.query("insert into student (name,age,time) values ('testfromnodjs',1,'2020-08-19T17:37:00')", (err, res) => {
//     console.log(err, res)
// });

pool.query('SELECT * FROM student', (err, res) => {
    console.log(err, res.rows);
});

pool.query('delete FROM student where age = ${1}', (err, res) => {
    console.log(err, res.rows);
});



pool.end();