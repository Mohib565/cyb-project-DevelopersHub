const express = require("express")
const helmet = require("helmet")
const validator = require("validator")
const bcrypt = require("bcrypt")

const db = require("./models/db")

const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

// Security headers
app.use(helmet())

// Home page
app.get("/", (req, res) => {
    res.render("login")
})

/*
    🔹 REGISTER PAGE (GET)
*/
app.get("/register", (req, res) => {
    res.send(`
        <h2>Register</h2>
        <form method="POST" action="/register">
            <input name="username" placeholder="username" required />
            <input name="password" placeholder="password" required />
            <button type="submit">Register</button>
        </form>
    `)
})

/*
    🔹 REGISTER USER (POST)
    Password hashing included
*/
app.post("/register", async (req, res) => {

    let username = req.body.username
    let password = req.body.password

    if (!username || !password) {
        return res.send("All fields required")
    }

    username = validator.escape(username)

    const hashedPassword = await bcrypt.hash(password, 10)

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err) => {
            if (err) {
                return res.send("Error registering user")
            }
            res.send("USER REGISTERED SUCCESSFULLY 🔐")
        }
    )
})

/*
    🔹 LOGIN (SECURE VERSION)
*/
app.post("/login", (req, res) => {

    let username = req.body.username
    let password = req.body.password

    if (!username || !password) {
        return res.send("All fields required")
    }

    username = validator.escape(username)

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {

            if (err || !user) {
                return res.send("LOGIN FAILED ❌")
            }

            const match = await bcrypt.compare(password, user.password)

            if (!match) {
                return res.send("LOGIN FAILED ❌")
            }

            res.send(`
                <h2>LOGIN SUCCESS 🔐</h2>
                <p>Welcome ${username}</p>
            `)
        }
    )
})

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
})