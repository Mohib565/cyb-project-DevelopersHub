const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.db")

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    `)

    // RESET demo user every time (FOR TESTING ONLY)
    db.run(`DELETE FROM users`)

    db.run(`
        INSERT INTO users (username, password)
        VALUES ('admin', '1234')
    `)

})

module.exports = db