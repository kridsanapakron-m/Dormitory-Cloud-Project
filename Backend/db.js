// const sqlite3 = require('sqlite3').verbose();
// const config = require('./config');

// const db = new sqlite3.Database('./dormitory.db',(error) => {
//     if (error) {
//         console.error("Error connecting to SQLite database:", error.message);
//         throw error;
//     }
//     console.log("Successfully connected to the SQLite database.");
// });

//module.exports = { db };

const mysql = require('mysql2');
const config = require('./config');

const db = mysql.createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port || 3306
});

db.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error.message);
    throw error;
  }
  console.log("Successfully connected to MySQL (XAMPP).");
});

module.exports = { db };