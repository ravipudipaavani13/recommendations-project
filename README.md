# recommendations-project

This is a repository about recommendations-project. 

# Basic Setup Steps
 - git clone <repository_url>
 - cd <repository_name>
 - npm install

# Set Up Environment Variables
 - Create a .env file in the root directory and add the following:
    * DATABASE_URL=<your_database_connection_string>

# Run the below query
 - Add the ciollections table
    * CREATE TABLE collections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        caption TEXT,
        category VARCHAR(50),
        pictures TEXT[],
        recommendation_ids INTEGER[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
 - Note: The users and recommendations tables were not exist, then add.
    * CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        fname VARCHAR(50) NOT NULL,
        sname VARCHAR(50) NOT NULL,
        profile_picture VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    * CREATE TABLE recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        caption TEXT,
        category VARCHAR(50),
        pictures TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

# Run the permissions if required
 - GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO `DB_USER`;
 - GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO `BATABASE_NAME`;

# Start the Server
 - node src/app.js or node app.js

# API Endpoints
 - Add collections - POST: http://url:3000/api/collections
 - Get collections - GET: https://url:3000/api/collections?user_id=1&page=1&limit=10
 - Add recommendations to collections - POST: https://url:3000//apicollections/:collectionId/recommendations/:recommendationId
 - Remove recommendations from collections
 - Remove collections - DELETE: https://url:3000/api/collections/:collectionId/recommendations/:recommendationId

 - Add users - POST: https://url:3000/api/users
 - Get users - GET: https://url:3000/api/users

 - Add recommendations - POST: https://url:3000/api/recommendations
 - Get recommendations - GET: https://url:3000/api/recommendations

# SUPPORT
 - If any queries reach out to Pavani ravipudi
 - email: pavni.ravipudi@gmail.com