const express = require('express');
const pool = require('./db');
const router = express.Router();

// Create a new collection
router.post('/collections', async (req, res) => {
    const { user_id, name, description, user_name = 'Default Name', user_email = 'default@example.com' } = req.body;
    try {
        // Check if the user exists
        let userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userCheck.rowCount === 0) {
            // If user does not exist, create the user
            userCheck = await pool.query(
                'INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *',
                [user_id, user_name, user_email]
            );
        }

        const result = await pool.query(
            'INSERT INTO collections (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [user_id, name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// View all collections for a user
router.get('/collections', async (req, res) => {
    const { user_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
        const collections = await pool.query(
            'SELECT * FROM collections WHERE user_id = $1 LIMIT $2 OFFSET $3',
            [user_id, limit, offset]
        );
        let result = [];
        for (const collection of collections.rows) {
            // const recommendations = await pool.query(
            //     `SELECT * FROM recommendations WHERE collections @> '[$1]'`,
            //     [collection.id]
            // );
            result.push({ ...collection });
            //, recommendations: recommendations.rows
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;

