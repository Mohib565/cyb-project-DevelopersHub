const express = require("express")
const db = require("./models/db")

const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

// Home page
app.get("/", (req, res) => {
    res.render("login")
})

/*
    🔴 VULNERABLE LOGIN (FOR XSS + SQL TESTING)
*/

app.post("/login", (req, res) => {

    const username = req.body.username
    const password = req.body.password

    // 🔥 SQL Injection vulnerable query
    const query = `
        SELECT * FROM users 
        WHERE username = '${username}' 
        AND password = '${password}'
    `

    console.log("EXECUTING QUERY:", query)

    db.get(query, (err, row) => {

        if (row) {
            res.send(`
                <h2>LOGIN SUCCESS (VULNERABLE SYSTEM)</h2>
                <p>Welcome: ${username}</p>
            `)
        } else {
            res.send(`
                <h2>LOGIN FAILED</h2>
                <p>Try again</p>
                <p>Input: ${username}</p>
            `)
        }

    })

})

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
})