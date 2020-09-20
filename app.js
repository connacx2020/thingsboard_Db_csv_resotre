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

readFromCSV('./Publika CSV (1706 - 0508) - Sheet1.csv');


function readFromCSV(filepath) {
    fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (row) => {
            let momentDate = moment(row.datetime, "DD/MM/YYYY");                                        //convert date format dd/mm/yyyy to mm/dd/yyyy
            let date = momentDate.toDate().toLocaleDateString() + ' 13:00:00';                          //convert date format dd/mm/yyyy to mm/dd/yyyy
            result.push(row.door + ',' + new Date(date).getTime().toString() + ',' + row.visitor);      //push result to array
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            pushToDB(process.argv[2]);   // change door at parameter

        });
}

function pushToDB(door) {
    let totalcsvData = 0;

    // pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door2',${result[0].split(',')[1]},null,null,${result[0].split(',')[2]},null);`, (err, res) => {
    //     console.log(err, res.command)
    // });

    let EastData = [];
    let WestData = [];
    let CircleData = [];
    let B2Data = [];

    result.map((res) => {
        totalcsvData++;
        if (res.split(',')[0] === 'East') {
            EastData.push(res);
        }
        else if (res.split(',')[0] === 'West') {
            WestData.push(res);
        }
        else if (res.split(',')[0] === 'Circle') {
            CircleData.push(res);
        }
        else if (res.split(',')[0] === 'B2') {
            B2Data.push(res);
        }
    });

    switch (door) {
        case 'East':
            EastData.map(res =>
                pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door1',${res.split(',')[1]},null,null,${res.split(',')[2]},null);`, (err, result) => {
                    console.log(err, result.command);
                })
            )
            break;

        case 'West':
            WestData.map(res => {
                console.log(res)
                pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door2',${res.split(',')[1]},null,null,${res.split(',')[2]},null);`, (err, result) => {
                    console.log(err, result.command)
                })
            }
            )
            break;

        case 'Circle':
            CircleData.map(res =>
                pool.query(`insert into ts_kv (entity_type,entity_id,key,ts,bool_v,str_v,long_v,dbl_v) values ('CUSTOMER','1ea296c156d41b083816530eccc01ed','visitor_count_door3',${res.split(',')[1]},null,null,${res.split(',')[2]},null);`, (err, result) => {
                    console.log(err, result.command)
                })
            )
            break;

        case 'B2':
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

