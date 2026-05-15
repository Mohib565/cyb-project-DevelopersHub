const express = require("express")
const helmet = require("helmet")
const validator = require("validator")
const bcrypt = require("bcrypt")
const winston = require("winston")

const db = require("./models/db")

const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

// Security headers
app.use(helmet())

/*
    🔥 WINSTON LOGGER
*/
const logger = winston.createLogger({

    transports: [

        new winston.transports.Console(),

        new winston.transports.File({
            filename: "security.log"
        })

    ]

})

// App started log
logger.info("Application started")

/*
    🔹 HOME PAGE
*/
app.get("/", (req, res) => {

    logger.info("Home page visited")

    res.render("login")
})

/*
    🔹 REGISTER PAGE (GET)
*/
app.get("/register", (req, res) => {

    logger.info("Register page opened")

    res.send(`
        <h2>Register</h2>

        <form method="POST" action="/register">

            <input name="username" placeholder="username" required />

            <input 
                type="password" 
                name="password" 
                placeholder="password" 
                required 
            />

            <button type="submit">Register</button>

        </form>
    `)
})

/*
    🔹 REGISTER USER (POST)
*/
app.post("/register", async (req, res) => {

    let username = req.body.username
    let password = req.body.password

    if (!username || !password) {

        logger.warn("Empty register fields")

        return res.send("All fields required")
    }

    // Input sanitization
    username = validator.escape(username)

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10)

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],

        (err) => {

            if (err) {

                logger.error("Registration failed")

                return res.send("Error registering user")
            }

            logger.info(`User registered: ${username}`)

            res.send("USER REGISTERED SUCCESSFULLY 🔐")
        }
    )
})

/*
    🔹 LOGIN USER
*/
app.post("/login", (req, res) => {

    let username = req.body.username
    let password = req.body.password

    if (!username || !password) {

        logger.warn("Empty login fields")

        return res.send("All fields required")
    }

    // Sanitize input
    username = validator.escape(username)

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],

        async (err, user) => {

            if (err || !user) {

                logger.warn(`Failed login attempt: ${username}`)

                return res.send("LOGIN FAILED ❌")
            }

            // Compare hashed password
            const match = await bcrypt.compare(
                password,
                user.password
            )

            if (!match) {

                logger.warn(`Wrong password attempt: ${username}`)

                return res.send("LOGIN FAILED ❌")
            }

            logger.info(`Successful login: ${username}`)

            res.send(`
                <h2>LOGIN SUCCESS 🔐</h2>

                <p>Welcome ${username}</p>
            `)
        }
    )
})

/*
    🔹 SERVER START
*/
app.listen(3000, () => {

    logger.info("Server running on port 3000")

    console.log("Server running on http://localhost:3000")
})