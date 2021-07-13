let express = require('express');
let app = express();
const port = 7072;

const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    database: "crypto-course-database",
});

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You got what');
})

app.get('/wrotedata', (req, res) => {
    let check = false;
    connection.query("SELECT * FROM cryptocoursebidasktable",
        async function (err, results) {
            for (let index = 0; index < results.length; index++) {
                if (req.query.instrument === results[index]['Name'])
                    check = true;
            }
            if (check) {
                await updateDataInDB(req);
                // let query = 'Update cryptocoursebidasktable SET Time = ?, BID = ?, ASK =? Where Name = ?';
                // connection.query(query, [req.query.time, req.query.bestBid, req.query.bestAsk,
                //     req.query.instrument], function (err, rows) {
                //     if (err)
                //         console.log("Error: " + err.message);
                //     else
                //         console.log(rows);
                // });
            } else {
                await wroteDataInDB(req, res);
                // let insertData = [req.query.time, req.query.bestBid, req.query.bestAsk, req.query.instrument];
                // const sql = "Insert Into cryptocoursebidasktable (Time, BID, ASK, Name) Values (?,?,?,?)";
                // connection.query(sql, insertData, function (err, result) {
                //     if (err)
                //         console.log("Error: " + err)
                //     else
                //         console.log("Data insert!");
                // })
                // res.statusCode = 200;
                // console.log(req.query);
                // res.send("hello")
            }
        })
})

app.listen(port, () => {
    console.log("Server listen port: " + port);
})

async function updateDataInDB(req) {
    let query = 'Update cryptocoursebidasktable SET Time = ?, BID = ?, ASK =? Where Name = ?';
    connection.query(query, [req.query.time, req.query.bestBid, req.query.bestAsk,
        req.query.instrument], function (err, rows) {
        if (err)
            console.log("Error: " + err.message);
        else
            console.log(rows);
    })
}

async function wroteDataInDB(req, res){
    let insertData = [req.query.time, req.query.bestBid, req.query.bestAsk, req.query.instrument];
    const sql = "Insert Into cryptocoursebidasktable (Time, BID, ASK, Name) Values (?,?,?,?)";
    connection.query(sql, insertData, function (err) {
        if (err)
            console.log("Error: " + err)
        else
            console.log("Data insert!");
    })
    res.statusCode = 200;
    console.log(req.query);
    res.send("hello")
}