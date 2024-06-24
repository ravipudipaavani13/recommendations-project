const express = require('express');
const pool = require('./db');
const router = express.Router();

// Create a new collection
router.post('/collections', async (req, res) => {
    const { user_id, title, caption, category, pictures } = req.body;

    try {
        // Check if the user exists; if not, create the user
        let userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userCheck.rowCount === 0) {
            const newUser = await pool.query(
                'INSERT INTO users (id) VALUES ($1) RETURNING *',
                [user_id]
            );
            console.log(`Created new user with ID: ${newUser.rows[0].id}`);
        }

        // Insert the new collection into collections table
        const collectionResult = await pool.query(
            'INSERT INTO collections (user_id, title, caption, category, pictures) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, title, caption, category, pictures]
        );

        res.status(201).json({ message: 'Collection created successfully', collection: collectionResult.rows[0] });
    } catch (error) {
        console.error('Error creating collection:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Add a recommendation to a collection
router.post('/collections/:collectionId/recommendations/:recommendationId', async (req, res) => {
    const { collectionId, recommendationId } = req.params;

    try {
        // Check if the collection exists and get its user_id
        const collectionQuery = 'SELECT user_id FROM collections WHERE id = $1';
        const collectionResult = await pool.query(collectionQuery, [collectionId]);

        if (collectionResult.rowCount === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const collectionUserId = collectionResult.rows[0].user_id;

        // Check if the recommendation exists and get its user_id
        const recommendationQuery = 'SELECT user_id FROM recommendations WHERE id = $1';
        const recommendationResult = await pool.query(recommendationQuery, [recommendationId]);

        if (recommendationResult.rowCount === 0) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        const recommendationUserId = recommendationResult.rows[0].user_id;

        // Compare user_ids from collection and recommendation
        if (collectionUserId !== recommendationUserId) {
            return res.status(400).json({ error: 'Recommendation does not belong to the user' });
        }

        // Check if the recommendation is already in the collection
        const checkDuplicateQuery = `
            SELECT recommendation_ids 
            FROM collections 
            WHERE id = $1 AND $2 = ANY(recommendation_ids)
        `;
        const checkDuplicateResult = await pool.query(checkDuplicateQuery, [collectionId, recommendationId]);

        if (checkDuplicateResult.rows.length > 0) {
            return res.status(400).json({ error: 'Recommendation already exists in the collection' });
        }

        const updateQuery = `
        UPDATE collections
        SET recommendation_ids = array_append(recommendation_ids, $1)
        WHERE id = $2
        RETURNING *
    `;
        const updateResult = await pool.query(updateQuery, [recommendationId, collectionId]);


        res.status(201).json(updateResult.rows[0]);
    } catch (error) {
        console.error('Error adding recommendation to collection:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// Remove a recommendation from a collection
router.delete('/collections/:collectionId/recommendations/:recommendationId', async (req, res) => {
    const { collectionId, recommendationId } = req.params;

    try {
        // Check if the collection exists and fetch its recommendation_ids
        const collectionQuery = `
            SELECT user_id, recommendation_ids 
            FROM collections 
            WHERE id = $1
        `;
        const collectionResult = await pool.query(collectionQuery, [collectionId]);

        if (collectionResult.rowCount === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const { user_id, recommendation_ids } = collectionResult.rows[0];

        // Check if the recommendation exists in the collection
        if (!recommendation_ids.includes(parseInt(recommendationId))) {
            return res.status(404).json({ error: 'Recommendation not found in the collection' });
        }

        // Update the collection to remove the recommendation_id
        const updateQuery = `
            UPDATE collections
            SET recommendation_ids = array_remove(recommendation_ids, $1)
            WHERE id = $2
            RETURNING *
        `;
        const updateResult = await pool.query(updateQuery, [parseInt(recommendationId), collectionId]);

        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error('Error removing recommendation from collection:', error.message);
        res.status(500).json({ error: error.message });
    }
});


router.get('/collections', async (req, res) => {
    const { user_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        // Check if the user exists
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch collections for the user with pagination
        const collectionsQuery = `
        SELECT * FROM collections WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const collectionsResult = await pool.query(collectionsQuery, [user_id, limit, offset]);

        // Fetch total count of collections for pagination metadata
        const totalCountQuery = `
        SELECT COUNT(*) AS total_count FROM collections WHERE user_id = $1 `;
        const totalCountResult = await pool.query(totalCountQuery, [user_id]);
        const totalCount = parseInt(totalCountResult.rows[0].total_count);

        // Prepare response object with collections and pagination metadata
        const response = {
            user_id: user_id,
            page: parseInt(page),
            limit: parseInt(limit),
            total_count: totalCount,
            collections: collectionsResult.rows,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching collections:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Remove a collection
router.delete('/collections/:collectionId', async (req, res) => {
    const { collectionId } = req.params;

    try {
        // Check if the collection exists
        const collectionQuery = ` 
            SELECT *
            FROM collections
            WHERE id = $1
        `;
        const collectionResult = await pool.query(collectionQuery, [collectionId]);

        if (collectionResult.rowCount === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Delete the collection
        const deleteQuery = `
            DELETE FROM collections
            WHERE id = $1
            RETURNING *
        `;
        const deleteResult = await pool.query(deleteQuery, [collectionId]);

        res.status(200).json(deleteResult.rows[0]);
    } catch (error) {
        console.error('Error deleting collection:', error.message);
        res.status(500).json({ error: error.message });
    }
});

//User API's
router.get('/users', async (req, res) => {
    try {
        const usersResult = await pool.query('SELECT * FROM users');
        res.status(200).json(usersResult.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users', async (req, res) => {
    const { fname, sname, profile_picture, bio, created_at } = req.body;

    try {
        const insertUserQuery = `
            INSERT INTO users (fname, sname, profile_picture, bio, created_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [fname, sname, profile_picture, bio, created_at];

        const result = await pool.query(insertUserQuery, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Recommendations API's
router.get('/recommendations', async (req, res) => {
    try {
        const recommendationsResult = await pool.query('SELECT * FROM recommendations');
        res.status(200).json(recommendationsResult.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/recommendations', async (req, res) => {
    const { user_id, title, caption, category, pictures, created_at } = req.body;

    try {
        const insertRecommendationQuery = `
            INSERT INTO recommendations (user_id, title, caption, category, pictures, created_at)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING * `;

        const values = [user_id, title, caption, category, pictures, created_at];

        const result = await pool.query(insertRecommendationQuery, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

