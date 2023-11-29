const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Connect to MySQL database
const connection = mysql.createConnection({
  host: 'talkdeitest.database.windows.net',
  port:'1433',
  user: 'deploy_db_group',
  password: '6;MU7`ND6a',
  database: 'talkdei'
});

// Define a table for user data in MySQL database
connection.query('CREATE TABLE IF NOT EXISTS users (name VARCHAR(255), email VARCHAR(255), jobTitle VARCHAR(255), companyName VARCHAR(255), companySize VARCHAR(255), industry VARCHAR(255), location VARCHAR(255), betaTesting BOOLEAN, diversitySupplier BOOLEAN)');

// Create an Express app
const app = express();

// Use body parser middleware to parse JSON data in request body
app.use(bodyParser.json());

// Define a signup API endpoint
app.post('/api/signup', async (req, res) => {
  const userData = req.body;

  // Validate user data
  if (!userData.name || !userData.email) {
    return res.status(400).send('Missing required fields: name and email');
  }

  // Check if user already exists with the provided email
  const existingUser = await connection.query('SELECT * FROM users WHERE email = ?', [userData.email]);
  if (existingUser.length > 0) {
    return res.status(409).send('User with this email already exists');
  }

  // Insert new user data into the MySQL database
  const newUser = await connection.query('INSERT INTO users (name, email, jobTitle, companyName, companySize, industry, location, betaTesting, diversitySupplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [userData.name, userData.email, userData.jobTitle, userData.companyName, userData.companySize, userData.industry, userData.location, userData.betaTesting, userData.diversitySupplier]);

  // Send a success response
  res.status(201).send('User successfully registered');
});

// Start the server
app.listen(3000, () => console.log('Server started on port 3000'));
