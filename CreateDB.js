var mysql = require('mysql');

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

connection.end(function(err){
	if (err) throw err;
});

console.log("database created");

