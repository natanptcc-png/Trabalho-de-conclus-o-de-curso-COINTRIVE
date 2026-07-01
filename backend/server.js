require('dotenv').config();

const express = require('express');
const cors = require("cors");
const db = require("./db");

const API = express();
const PORT = 4040;

API.use(express.json());
API.use(cors());

////////////////////////////////////////

/////////////////////////// JWT AUTH

////////////////////////////////////////

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_TKN, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }

        req.user = user;

        next();
    });
}

API.post("/login", async (req, res) => {
    try {
        
        
    } catch(err) {
        return res.status(500).json(err);
    }
})

API.post("/register", async (req,res) => {
    try {

        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({err: "Missing data."});
        }

        const hashed_pass = bcrypt.hash(password, 10);

        const [create_user] = await db.query(
            `INSERT INTO bd_users (first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashed_pass]
        );

        const getUserID = create_user.insertId;

        const [create_wallet] = await db.query(
            `INSERT INTO bd_user_wallet (userId, income, expense, balance) VALUES (?, ?, ?, ?)`,
            [getUserID, 0.00, 0.00, 0.00]
        );

        return res.status(200).json({msg: "Created user successfully"});

    } catch(err) {
        return res.status(500).json(err);
    }
})

////////////////////////////////////////

/////////////////////////// USER PROFILE

////////////////////////////////////////

API.get("/users", async (req, res) => {
    try {

        const [result] = await db.query(
            `SELECT first_name, last_name, email, role FROM bd_users`
        )

        return res.status(200).json(result);

    } catch(err) {
        return res.status(500).json(err);
    }
})

API.get("/users/:id", async (req, res) => {
    try {

        const USER_ID = req.params.id;

        const [result] = await db.query(
            `SELECT first_name, last_name, email, role FROM bd_users WHERE id = ?`,
            [USER_ID]
        )

        if (result.length === 0) {
            return res.status(404).json({err: "User not found."})
        }

        return res.status(200).json(result);

    } catch(err) {
        return res.status(500).json(err);
    }
})

API.listen(PORT, ()=>{
    console.log(`Logged in to host http://localhost:${PORT}`)
})