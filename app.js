var express = require('express');

var body_parser = require('body-parser'); //to handle posted data
var path = require('path'); // for directory paths
var config = require(path.join(__dirname, 'config')); // has our keys
var request = require('request'); // to make backend requests to stripe
var mysql = require('mysql');
var app = express();
app.use(body_parser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var TABLE = 'USER';
var connection = mysql.createConnection( {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'notdeadyet'
});

connection.connect();


connection.query('CREATE DATABASE IF NOT EXISTS notdeadyet',
     function (error, results, fields) {
          if (error) throw error;
     }
);
connection.query('USE notdeadyet', function (error, results, fields) {
   if (error) throw error;
});

connection.query('CREATE TABLE IF NOT EXISTS USER (ID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, LAST_CHECK_IN INTEGER (11) NOT NULL DEFAULT 0, LAST_EMAIL_SENT INTEGER (11) NOT NULL DEFAULT 0, NOTIFY_LIST TEXT, MESSAGE TEXT )',
 function(err, results, fields) {
    if (err) throw err;
});

app.get('/', function(req, res) {
  res.render('index', { 'PUBLISHABLE_KEY': config.PUBLISHABLE_KEY });
});
app.post('/charge', function(req, res) {

    var incomingEmail = req.body.email;
    console.log(incomingEmail);

    var currentTime = Math.floor(new Date() / 1000);
    console.log(currentTime);
    var lastID = connection.query('SELECT LAST_INSERT_ID()');
    var post = {ID: lastID, LAST_CHECK_IN: currentTime, LAST_EMAIL_SENT: 0, NOTIFY_LIST: "", MESSAGE: "" };
    var query = connection.query('INSERT INTO USER SET ?', post, function(err,res) {

    });
    console.log(query.sql);
    //connection.query('INSERT INTO USER (ID, LAST_CHECK_IN, LAST_EMAIL_SENT, LAST_EMAIL_SENT, NOTIFY_LIST, MESSAGE) VALUES ?', incomingEmail);

    /*here we use the request module to make a stripe request using
      the token we received from our form*/
    request.post({
        url:config.CHARGE_URL, 
        form: {
            //swipe charges in cents * 100 to convert to dollars
            "amount": req.body.amount * 100,
            "currency": config.CHARGE_CURRENCY,
            "source": req.body.credit_token,
            "description": config.CHARGE_DESCRIPTION
            },
        auth: {
            'user': config.SECRET_KEY,
            'pass': ''
            }
        },
        function(err, http_response, body) {
            stripe_result = JSON.parse(body);
            if (typeof stripe_result.status === 'undefined') {
                if (typeof stripe_result.message === 'undefined') {
                    res.render('message', { 'message': req.body.amount +
                        "charge did not do through!<br />" +
                        stripe_result.credit_message});
                }
            } else if (stripe_result.status == 'succeeded') {
                res.render('message', { 'message': req.body.amount +
                    "charged" });
            }
        }
    );
});
app.listen(8888, function () {
    console.log('Credit Server up!')
})
