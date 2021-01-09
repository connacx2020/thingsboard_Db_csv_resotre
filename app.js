const csv = require('csv-parser');
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

let result = [];

readFromCSV('./data.csv');


function readFromCSV(filepath) {
    fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (row) => {
            let momentDate = moment(row.datetime, "MM/DD/YYYY");                                        //convert date format dd/mm/yyyy to mm/dd/yyyy
            let date = momentDate.toDate().toLocaleDateString() + ' 13:00:00';
            result.push(row.door + ',' + new Date(date).getTime().toString() + ',' + row.visitor);      //push result to array
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            pushToDB(process.argv[2]);   // change door at parameter

        });
}

function pushToDB(door) {
    let totalcsvData = 0;

    // pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door2',123,null,null,4,null);`, (err, res) => {
    //     console.log(err, res.command)
    // });

    let EastData = [];
    let WestData = [];
    let CircleData = [];
    let B2Data = [];

    result.map((res) => {
        totalcsvData++;
        if (res.split(',')[0].toLowerCase() === 'east') {
            EastData.push(res);
        }
        else if (res.split(',')[0].toLowerCase() === 'west') {
            WestData.push(res);
        }
        else if (res.split(',')[0].toLowerCase() === 'circle') {
            CircleData.push(res);
        }
        else if (res.split(',')[0].toLowerCase() === 'b2') {
            B2Data.push(res);
        }
    });

    switch (door.toLowerCase()) {
        case 'east':
            EastData.map(res =>
                pool.query(`INSERT INTO ts_kv values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door1',${parseInt(res.split(',')[1])},null,null,${parseInt(res.split(',')[2])},null);`, (err, result) => {
                    console.log(err, result.command);
                })
            )
            break;

        case 'west':
            WestData.map(res => {
                console.log(res)
                pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door2',${res.split(',')[1]},null,null,${res.split(',')[2]},null);`, (err, result) => {
                    console.log(err, result.command)
                })
            }
            )
            break;

        case 'circle':
            CircleData.map(res =>
                pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door3',${res.split(',')[1]},null,null,${res.split(',')[2]},null);`, (err, result) => {
                    console.log(err, result.command)
                })
            )
            break;

        case 'b2':
            B2Data.map(res =>
                pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door4',${res.split(',')[1]},null,null,${res.split(',')[2]},null);`, (err, result) => {
                    console.log(err, result.command)
                })
            )
            break;

    }


    console.log('Total Csv east data:', EastData.length);
    console.log('Total Csv west data:', WestData.length);
    console.log('Total Csv circle data:', CircleData.length);
    console.log('Total Csv b2 data:', B2Data.length);
    console.log('Total Csv all door data:', totalcsvData);
}

