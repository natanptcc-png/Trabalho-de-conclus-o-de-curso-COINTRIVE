require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const API = express();
const PORT = process.env.PORT || 4040;
const JWT_TKN = process.env.JWT_TKN || 'dev-secret-key';

API.use(express.json());
API.use(cors());

////////////////////////////////////////

/////////////////////////// JWT AUTH

////////////////////////////////////////

function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, JWT_TKN, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}

async function findUserByEmail(email) {
    const [rows] = await db.query(
        `SELECT id, first_name, last_name, email, password, currency, role
         FROM bd_users
         WHERE email = ?`,
        [String(email || '').trim().toLowerCase()]
    );
    return rows[0];
}

async function findUserById(id) {
    const [rows] = await db.query(
        `SELECT id, first_name, last_name, email, currency, role
         FROM bd_users
         WHERE id = ?`,
        [id]
    );
    return rows[0];
}

async function findUserByIdWithPassword(id) {
    const [rows] = await db.query(
        `SELECT id, first_name, last_name, email, password, currency, role
         FROM bd_users
         WHERE id = ?`,
        [id]
    );
    return rows[0];
}

function mapUserProfile(row) {
    if (!row) return null;
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        currency: row.currency || 'BRL',
        role: row.role || 'user',
    };
}

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || 'user',
        },
        JWT_TKN,
        { expiresIn: '8h' }
    );
}

////////////////////////////////////////

/////////////////////////// AUTHENTICATION

////////////////////////////////////////

API.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são necessários.' });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        const token = createToken(mapUserProfile(user));
        const [transactions] = await db.query(
            `SELECT id, userId, DATE_FORMAT(date, '%Y-%m-%d') AS date, description, category, type, amount, payment, isPaid
             FROM bd_transactions
             WHERE userId = ?
             ORDER BY date DESC`,
            [user.id]
        );

        return res.status(200).json({
            token,
            user: mapUserProfile(user),
            transactions,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Login failed.', details: err.message });
    }
});

API.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ error: 'Email e senha são necessários.' });
        }

        const existingUser = await findUserByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ error: 'Email já em uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [insertResult] = await db.query(
            `INSERT INTO bd_users
             (first_name, last_name, email, password, currency, role)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                String(firstName || 'Novo').trim(),
                String(lastName || 'Usuário').trim(),
                normalizedEmail,
                hashedPassword,
                'BRL',
                'user',
            ]
        );

        const user = await findUserById(insertResult.insertId);
        const token = createToken(mapUserProfile(user));

        return res.status(201).json({
            token,
            user: mapUserProfile(user),
            transactions: [],
        });
    } catch (err) {
        return res.status(500).json({ error: 'Register failed.', details: err.message });
    }
});

////////////////////////////////////////

/////////////////////////// USER PROFILE

////////////////////////////////////////

API.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.status(200).json(mapUserProfile(user));
    } catch (err) {
        return res.status(500).json({ error: 'Unable to load profile.', details: err.message });
    }
});

API.patch('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, currency, currentPassword, newPassword } = req.body;
        const updates = [];
        const values = [];

        if (firstName !== undefined) {
            updates.push('first_name = ?');
            values.push(String(firstName || '').trim());
        }
        if (lastName !== undefined) {
            updates.push('last_name = ?');
            values.push(String(lastName || '').trim());
        }
        if (currency !== undefined) {
            updates.push('currency = ?');
            values.push(String(currency || 'BRL').trim());
        }

        if (newPassword !== undefined) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to change password.' });
            }
            const user = await findUserByIdWithPassword(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const validPassword = await bcrypt.compare(String(currentPassword), user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect.' });
            }
            const hashedPassword = await bcrypt.hash(String(newPassword), 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        if (updates.length > 0) {
            await db.query(
                `UPDATE bd_users
                 SET ${updates.join(', ')}
                 WHERE id = ?`,
                [...values, req.user.id]
            );
        }

        const user = await findUserById(req.user.id);
        return res.status(200).json(mapUserProfile(user));
    } catch (err) {
        return res.status(500).json({ error: 'Unable to update profile.', details: err.message });
    }
});

API.patch('/profile/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required.' });
        }

        const user = await findUserByIdWithPassword(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const validPassword = await bcrypt.compare(String(currentPassword), user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), 10);
        await db.query(
            `UPDATE bd_users
             SET password = ?
             WHERE id = ?`,
            [hashedPassword, req.user.id]
        );

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Unable to change password.', details: err.message });
    }
});

API.patch("/profile/force-reset/:id", authenticateToken, async(req,res) => {
    try {
        const { newPassword } = req.body;
        const { id } = req.params.id;

        if (!newPassword) {
            return res.status(400).json({error: "Missing new password."})
        }

        if (newPassword.length < 8) {
            return res.status(400).json({error: "The new password must be 8 characters long minimum."})
        }

        const user = await findUserByIdWithPassword(req.user.id);
        if (!user) {
            return res.status(404).json({error: "User not found."})
        }

        const hashed = await bcrypt.hash(String(newPassword), 10);
        await db.query(
            `UPDATE bd_users
            SET password = ?
            WHERE id = ?`,
            [hashed, id]
        );

        return res.status(200).json({success: true});

    } catch(err) {
        return res.status(500).json({error: "Unable to change password forcefully.", details: err.message});
    }
})

////////////////////////////////////////

/////////////////////////// TRANSACTIONS

API.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const [transactions] = await db.query(
            `SELECT id, userId, DATE_FORMAT(date, '%Y-%m-%d') AS date, description, category, type, amount, payment, isPaid
             FROM bd_transactions
             WHERE userId = ?
             ORDER BY date DESC`,
            [req.user.id]
        );
        return res.status(200).json(transactions);
    } catch (err) {
        return res.status(500).json({ error: 'Unable to load transactions.', details: err.message });
    }
});

API.post('/transactions', authenticateToken, async (req, res) => {
    try {
        const { date, description, category, type, amount, payment, isPaid } = req.body;
        const normalizedDate = (() => {
            const raw = String(date || new Date().toISOString().slice(0, 10));
            const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : raw.slice(0, 10);
        })();

        const [insertResult] = await db.query(
            `INSERT INTO bd_transactions
             (userId, date, description, category, type, amount, payment, isPaid)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                normalizedDate,
                String(description || 'Nova transação').trim(),
                String(category || 'Outros').trim(),
                String(type || 'Gastos').trim(),
                String(amount || '0,00').trim(),
                String(payment || 'Outro').trim(),
                isPaid === null ? null : Boolean(isPaid),
            ]
        );

        const [rows] = await db.query(
            `SELECT id, userId, DATE_FORMAT(date, '%Y-%m-%d') AS date, description, category, type, amount, payment, isPaid
             FROM bd_transactions
             WHERE id = ?`,
            [insertResult.insertId]
        );

        return res.status(201).json(rows[0]);
    } catch (err) {
        return res.status(500).json({ error: 'Unable to create transaction.', details: err.message });
    }
});

API.patch("/transactions/:id", authenticateToken, async (req, res) => {
    try {
        const txId = Number(req.params.id);

        const [existing] = await db.query(
            `SELECT id
             FROM bd_transactions
             WHERE id = ? AND userId = ?`,
            [txId, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: "Transaction not found."
            });
        }

        const updates = [];
        const values = [];

        if (req.body.date !== undefined) {
            const raw = String(req.body.date || "");
            const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
            const normalizedDate = match ? match[1] : raw.slice(0, 10);

            updates.push("date = ?");
            values.push(normalizedDate);
        }

        if (req.body.description !== undefined) {
            updates.push("description = ?");
            values.push(String(req.body.description).trim());
        }

        if (req.body.category !== undefined) {
            updates.push("category = ?");
            values.push(String(req.body.category).trim());
        }

        if (req.body.type !== undefined) {
            updates.push("type = ?");
            values.push(String(req.body.type).trim());
        }

        if (req.body.amount !== undefined) {
            updates.push("amount = ?");
            values.push(String(req.body.amount).trim());
        }

        if (req.body.payment !== undefined) {
            updates.push("payment = ?");
            values.push(String(req.body.payment).trim());
        }

        if (req.body.isPaid !== undefined) {
            updates.push("isPaid = ?");
            values.push(Boolean(req.body.isPaid));
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided to update."
            });
        }

        values.push(txId);

        await db.query(
            `UPDATE bd_transactions
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        const [rows] = await db.query(
            `SELECT id,
                    userId,
                    DATE_FORMAT(date, '%Y-%m-%d') AS date,
                    description,
                    category,
                    type,
                    amount,
                    payment,
                    isPaid
             FROM bd_transactions
             WHERE id = ?`,
            [txId]
        );

        return res.status(200).json(rows[0]);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Unable to update transaction.",
            details: err.message
        });
    }
});

API.delete('/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const txId = Number(req.params.id);
        const [existing] = await db.query(
            `SELECT id FROM bd_transactions WHERE id = ? AND userId = ?`,
            [txId, req.user.id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Transaction not found.' });
        }

        await db.query(`DELETE FROM bd_transactions WHERE id = ?`, [txId]);
        return res.status(200).json({ id: txId });
    } catch (err) {
        return res.status(500).json({ error: 'Unable to delete transaction.', details: err.message });
    }
});

////////////////////////////////////////

/////////////////////////// USER LIST

////////////////////////////////////////

API.get('/users', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, first_name AS firstName, last_name AS lastName, email, currency, role
             FROM bd_users`
        );
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ error: 'Unable to load users.', details: err.message });
    }
});

API.get('/users/:id', authenticateToken, async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.status(200).json(mapUserProfile(user));
    } catch (err) {
        return res.status(500).json({ error: 'Unable to load user.', details: err.message });
    }
});

const public_ip = process.env.MACHINE_IP

API.listen(PORT, public_ip, () => {
    console.log(`Logged in to host http://localhost:${PORT} or on http://${public_ip}:${PORT}`);
});