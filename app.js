var express = require('express');

var body_parser = require('body-parser'); //to handle posted data
var path = require('path'); // for directory paths
var config = require(path.join(__dirname, 'config')); // has our keys
var request = require('request'); // to make backend requests to stripe
var mysql = require('mysql');
var nodemailer = require('nodemailer');

var app = express();
var query;

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

connection.query('USE notdeadyet', function (error, results, fields) {
   if (error) throw error;

   console.log('Successfully connected to database');
});
 
var transporter = nodemailer.createTransport({
     service: 'Gmail', // no need to set host or port etc.
     auth: {
         user: 'mykhailo.behei@gmail.com',
         pass: 'Mishabehey1996'
     }
});

app.get('/', function(req, res) {
  res.render('index', { 'PUBLISHABLE_KEY': config.PUBLISHABLE_KEY });
});
var incomingEmail;
app.post('/charge', function(req, res) {

    incomingEmail = req.body.email;
    console.log(incomingEmail);

    var currentTime = Math.floor(new Date() / 1000);
    console.log(currentTime);

    var check_in_url = 'http://localhost'
    var options = {
    from: 'mykhailo.behei@gmail.com', // sender address
    to: incomingEmail, // list of receivers
    subject: 'Not-Dead-Yet Team', // Subject line
    text: 'Not-Dead-Yet...Time to Check-in! \n \n Dear ' + incomingEmail + ' \n \n Please click the link below or copy it into your browser to check-in \n \n check_in_url \n \n Best regards, Not-Dead-Yet Team', // plain text body
    //html: 'This is just a test.' // html body
    };
    var last_email_sent_time = Math.floor(new Date() / 1000);
    /*transporter.sendMail(options, function(error, info) {
    if (error) {
        return console.log(error);
        }
    });*/
    // console.log('Message Sent. Id: %s Res: %s', info.messageId, info.response);

    var lastID = connection.query('SELECT (LAST_INSERT_ID() + 1)');
    var post = {LAST_CHECK_IN: currentTime, LAST_EMAIL_SENT: last_email_sent_time, NOTIFY_LIST: "", MESSAGE: "" };
    query = connection.query('INSERT INTO USER SET ?', post, function(err,res) {
        if (err) throw err;

        console.log('Last record insert id:', res.insertId);
    });
    console.log(query.sql);

    var queryString = 'SELECT * FROM USER';
        connection.query(queryString, function(err, rows, fields) {
            if (err) throw err;

            for (var i in rows) {
                 console.log('ID: ', rows[i].ID);
                 console.log('Last check in ', rows[i].LAST_CHECK_IN );
            }
        });
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
                    " charged" });
            }
        }
    );
});

app.get('/check-in' , function(req,res) {
    res.render('check-in', { 
        'check_in_frequency' : config.check_in_frequency, 
        'notify_delay' : config.notify_delay,
        'email_job_frequency' : config.email_job_frequency,
        'current_email_incoming' : incomingEmail
        //'incomingEmail' : incomingEmail
    });
});

app.post('/notify', function(req, res) {
    //var email = req.body.current_email + 'some text';
    //console.log(email);
    var current_time_from_check_in = Math.floor(new Date()/1000);
    var emailFromFrom;
    if (req.body.current_email_incoming == undefined)
        emailFromFrom = incomingEmail;
    else
        emailFromFrom = req.body.current_email_incoming;

    console.log('The current email is ' + emailFromFrom);
    console.log('The notify list is ' + req.body.let_know_list);
    console.log('The message is ' + req.body.message_notify);

    connection.query('SELECT MAX(ID) as ID FROM USER', function(err, rows, fields) {
            console.log(rows);
    });
    var insertString = {LAST_CHECK_IN: current_time_from_check_in, LAST_EMAIL_SENT: Math.floor(new Date() / 1000), NOTIFY_LIST: req.body.let_know_list, MESSAGE: req.body.message_notify };
     query = connection.query('INSERT INTO USER SET ?', insertString, function(err,res) {
        if (err) throw err;

        console.log('Last record insert id:', res.insertId);
    });
    console.log(query.sql);
    res.render('index', { 'PUBLISHABLE_KEY': config.PUBLISHABLE_KEY });
});
app.listen(8888, function () {
    console.log('Credit Server up!')
})
