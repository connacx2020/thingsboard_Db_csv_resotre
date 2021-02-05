const csv = require('csv-parser');
const fs = require('fs');
const moment = require('moment');
const { pool } = require('./db');
const { config } = require('./config');
let result = [];

const entrance = process.argv[2].toLowerCase();

const restoreDataFromCSV = () => {
    fs.createReadStream('./data.csv')
        .pipe(csv())
        .on('data', (row) => {
            let momentDate = moment(row.datetime, "MM/DD/YYYY h:mm:ss").toLocaleString();
            // let date = momentDate.add(13, 'hours').toLocaleString();
            result.push({
                door: row.door.toLowerCase(),
                ts: new Date(momentDate).getTime(),
                visitor: parseInt(row.visitor),
                key: row.key
            })
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            pushToDB();
        });
}

const pushToDB = () => {
    console.log("Entrance:", entrance);
    const filteredByEntrance = result.filter((data) => data.door === entrance);
    const entityID = config.deviceIDs[entrance];
    console.log("Entity ID:", entityID);

    // pool.query(`INSERT INTO ts_kv(entity_id,key,ts,bool_v,str_v,long_v,dbl_v,json_v) values ('b0852a90-660c-11eb-96a2-c31866406f55',38,1586068200000,null,null,25,null,null);`, (err, result) => {
    //     console.log(err, result.command);
    // })
    filteredByEntrance.forEach(data => {
        const key = config.keys[data.key];
        console.log(key)
        const visitor = data.visitor;
        const ts = data.ts;
        const values = `'${entityID}',${key},${ts},null,null,${visitor},null,null`;
        const columns = 'entity_id,key,ts,bool_v,str_v,long_v,dbl_v,json_v';
        console.log(values);

        pool.query(`INSERT INTO ts_kv VALUES (${values});`, (err, result) => {
            console.log(err, result.command);
        })
    });
}

restoreDataFromCSV();