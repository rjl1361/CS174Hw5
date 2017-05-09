var mysql = require('mysql');
var connection = mysql.createConnection( {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'notdeadyet'
});

connection.connect();

/*connection.query('DROP DATABASE IF EXISTS notdeadyet', function(err, res, fields) {
    if (err) throw err;

    console.log('database' + connection.database + 'dropped');
})
*/
connection.query('CREATE DATABASE IF NOT EXISTS notdeadyet',
     function (error, results, fields) {
          if (error) throw error;
     }
);
connection.query('USE notdeadyet', function (error, results, fields) {
   if (error) throw error;
});

connection.query('CREATE TABLE IF NOT EXISTS USER (ID INT (10) NOT NULL AUTO_INCREMENT, LAST_CHECK_IN INT (10) NOT NULL DEFAULT 0, LAST_EMAIL_SENT INT (10) NOT NULL DEFAULT 0, NOTIFY_LIST VARCHAR(100) , MESSAGE VARCHAR(100), PRIMARY KEY (ID) )',
 function(err, results, fields) {
    if (err) throw err;

    console.log(results);
});

connection.end();
