// dependancies
var express = require('express');
var router = express.Router();
var app = require('./../app');

// default webpage render for localhost:3000
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

// get handler for list of devices
router.get('/devices', function (req, res) {
    var db = app.db;
    var data = [];
    db.all('SELECT DISTINCT id FROM pings', function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
            data.push(rows[i].id);
        }
        console.log(data);
        res.json(data);
    });
});

// get handler for single device on a particular date
router.get('/:id/:date', function(req, res){
    var db = app.db;
    var id = req.param('id'),
        date = new Date(req.param('date'));
    var sTime = date / 1000;
    var eTime = sTime + 86400;
    if (id == 'all'){ // following code builds the hash for the pings for each device on a certain date
        var hash = {};
        db.all('SELECT * FROM pings WHERE ping BETWEEN ? AND ?', [sTime, eTime - 1], function(err, rows) {
            for (var i = 0; i < rows.length; i++) {
                hash[rows[i].id] = [];
            }
            for (var j = 0; j < rows.length; j++) {
                hash[rows[j].id].push(rows[j].ping);
            }
            console.log(hash);
            res.json(hash);
        });
    } else { // standard return of pings from a single device on a certain date
        var data = [];
        db.all('SELECT ping FROM pings WHERE id=? AND ping BETWEEN ? AND ?', [id, sTime, eTime - 1], function (err, rows) {
            for (var i = 0; i < rows.length; i++) {
                data.push(rows[i].ping);
                console.log(data);
                res.json(data);
            }
        });
    }
});

// handler for get requests for pings between two points in time
router.get('/:id/:sTime/:eTime', function(req, res) {
    var db = app.db;
    var id = req.param('id'),
        sTime = req.param('sTime'),
        eTime = req.param('eTime');
    // code to check if url parameters are dates or timestamps
    if (sTime/sTime !== 1) {
        sTime = new Date(sTime).getTime() / 1000;
    }
    if (eTime/eTime !== 1) {
        eTime = new Date(eTime).getTime() / 1000;
    }
    if (id == 'all') { // builds and returns the hash for pings to all devices between points in time
        var hash = {};
        db.all('SELECT * FROM pings WHERE ping BETWEEN ? AND ?', [sTime, eTime - 1], function(err, rows) {
            for (var i = 0; i < rows.length; i++) {
                hash[rows[i].id] = [];
            }
            for (var j = 0; j < rows.length; j++) {
                hash[rows[j].id].push(rows[j].ping);
            }
            console.log(hash);
            res.json(hash);
        });
    } else { // standard handler for returning array of pings from particular device between two time points
        var data = [];
        db.all('SELECT ping FROM pings WHERE id=? AND ping BETWEEN ? AND ?', [id, sTime, eTime - 1], function (err, rows) {
            for (var i = 0; i < rows.length; i++) {
                data.push(rows[i].ping);
            }
            console.log(data);
            res.json(data);
        });
    }
});

// post handler to clear data from the database
router.post('/clear_data', function (req, res) {
    var db = app.db;
    db.run('DELETE FROM pings', function (err) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

// post handler to add [id: 'value', ping: 'value'] key pairs to the database
router.post('/:id/:time', function (req, res) {
    var db = app.db;
    var id = req.param('id'),
        time = req.param('time');
    db.run('INSERT INTO pings (id, ping) VALUES (?, ?)', [id, time], function (err, row) {
       if (err){
           console.log(err);
           res.sendStatus(500);
       } else {
           res.sendStatus(200);
       }
    });
});

// export router for use in the rest of the application
module.exports = router;
