const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

const db = new sqlite3.Database('./dormitory.db',(error) => {
    if (error) {
        console.error("Error connecting to SQLite database:", error.message);
        throw error;
    }
    console.log("Successfully connected to the SQLite database.");
});

// module.exports = { db };

// const mysql = require('mysql2');
// const config = require('./config');

// // module.exports = { host, user, password, database, port };

// const db = mysql.createConnection({
//   host: config.host,
//   user: config.user,
//   password: config.password,
//   database: config.database,
//   port: config.port || 3306
// });

// db.connect((error) => {
//   if (error) {
//     console.error("Error connecting to RDS MySQL:", error.message);
//     throw error;
//   }
//   console.log("Successfully connected to AWS RDS MySQL.");
// });

// module.exports = { db };