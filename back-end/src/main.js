let express = require('express');
let app = express();
const yaml = require("js-yaml");
const fs   = require('fs');
const port = 7072;
const mysql = require("mysql2");
const Binance = require("node-binance-api");

// loading config
try {
    const doc = yaml.load(fs.readFileSync('../settings.yaml', 'utf8'));
    console.log(doc);
} catch (e) {
    console.log(e);
}

const binance = new Binance().options({
    APIKEY: 'nc6lLi1aK0p4yzpRuLf4wWL23qyU3f2MUaS0287A9sz7N3eY33XakyYNDqCzdTVr',
    APISECRET: 'vdiJJ9d2Fih3YIEHA1iGauhcZmrmMls8oLcqiy5wlBT3VLJRqizqvcK6RPPL1xu5',
    reconnect: false
})

const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    database: "crypto-course-database",
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    next();
})

app.get('/wrotedata', (req, res, next) => {
    let check = false;
    connection.query("SELECT * FROM cryptocoursebidasktable",
        async function (err, results) {
            for (let index = 0; index < results.length; index++) {
                if (req.query.instrument === results[index]['Name'])
                    check = true;
            }
            if (check) {
                await updateDataInDB(req);
            } else {
                await wroteDataInDB(req, res);
            }
        })
})

app.get('/getinstrument', (req, res) => {
    const query = "SELECT DISTINCT (NAME) FROM cryptocoursebidasktable ORDER BY Name"
    connection.query(query, function (err, rows) {
        if (err)
            console.log("Error2: " + err.message)
        else
            res.send(rows)
    })
})

app.get('/getdatafromdatabase', (req, res) => {
    let searchData = req.query.instrument_array;

    searchData = searchData.split(",").filter(e => e.length).map(e => `Name = ` + mysql.escape(e)).join(" OR ");

    if (searchData.length === 0) {
        searchData = "0"
    }

    const query = 'SELECT * FROM cryptocoursebidasktable WHERE ' + searchData;
    connection.query(query, function (err, rows) {
        if (err)
            console.log("Error1: " + err.message);
        else {
            console.log(rows)
            res.send(rows);
        }
    })
})

app.listen(port, () => {
    console.log("Server listen port: " + port);
})

function collectData() {
    binance.futuresBookTickerStream((ticker) => {
        let oneTick = {
            para: ticker['symbol'],
            bestBid: ticker['bestBid'],
            bestAsk: ticker['bestAsk']
        }

        let query = "Insert Into temporary_table (time, pair, bid, ask) VALUES (NOW(),?,?,?)";
        connection.query(query, [oneTick.para, oneTick.bestBid, oneTick.bestAsk],
            function (err, rows) {
                if (err)
                    console.log("Error: " + err.message)
                else {
                    // console.log(rows);
                }
            })
    });
}

function updateDataInMainTable() {
    let query1 = "INSERT INTO cryptocoursebidasktable (TIME, bid, ask, NAME)" +
        "(SELECT NOW(), MIN(bid), MAX(ask), pair FROM temporary_table " +
        "WHERE TIME > DATE_SUB(NOW(), INTERVAL 20 SECOND) GROUP BY pair)"
    connection.query(query1, function (err, rows) {
        if (err)
            console.log("Error: " + err.message);
        else
            console.log("Sucses");
    })
    let query2 = "TRUNCATE TABLE temporary_table"
    connection.query(query2, function (err, rows) {
        if(err)
            console.log("error: " + err.message)
        else
            console.log("Data deleted");
    })
    setTimeout(updateDataInMainTable, 20000)
}

async function updateDataInDB(req) {
    let query = 'Update cryptocoursebidasktable SET Time = ?, BID = ?, ASK =? Where Name = ?';
    connection.query(query, [req.query.time, req.query.bestBid, req.query.bestAsk,
        req.query.instrument], function (err, rows) {
        if (err)
            console.log("Error: " + err.message);
        else {
            console.log(req.query.instrument);
            console.log(rows);
        }
    })
}

async function wroteDataInDB(req, res) {
    let insertData = [req.query.time, req.query.bestBid, req.query.bestAsk, req.query.instrument];
    const query = "Insert Into cryptocoursebidasktable (Time, BID, ASK, Name) Values (?,?,?,?)";
    connection.query(query, insertData, function (err) {
        if (err)
            console.log("Error: " + err)
        else
            console.log("Data insert!");
    })
    res.statusCode = 200;
    console.log(req.query);
    res.send("hello")
}

collectData();
updateDataInMainTable();