const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

const db = new sqlite3.Database('./dormitory.db',(error) => {
    if (error) {
        console.error("Error connecting to SQLite database:", error.message);
        throw error;
    }
    console.log("Successfully connected to the SQLite database.");
});

module.exports = { db };