require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.json());

// Your routes go here
app.use('/api', require('./routes'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});