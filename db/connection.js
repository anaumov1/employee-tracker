const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '1234al',
        database: 'employeeTracker'
    }
);

module.exports = db;