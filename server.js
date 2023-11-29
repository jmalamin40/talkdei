const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const mssql = require('mssql');

const createUsersTable = async () => {
  const connection = await mssql.connect({
    server: 'talkdeitest.database.windows.net',
  database: 'talkdeitest',
  user: 'talkdeiuser',
  password: '6;MU7`ND6a'

  });

  try {
    await connection.query(`
      CREATE TABLE users (
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) PRIMARY KEY,
        jobTitle NVARCHAR(255),
        companyName NVARCHAR(255),
        companySize NVARCHAR(255),
        industry NVARCHAR(255),
        location NVARCHAR(255),
        betaTesting BIT,
        diversitySupplier BIT
      );
    `);
    console.log('Users table created successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.close();
  }
};
createUsersTable();

// Connect to SQL Server database
const connection = new sql.ConnectionPool({
    server: 'talkdeitest.database.windows.net',
    database: 'talkdeitest',
    user: 'talkdeiuser',
    password: '6;MU7`ND6a'
  
});

// Create a table for user data in SQL Server database
connection.connect().then(() => {
  connection.query('CREATE TABLE IF NOT EXISTS users (name NVARCHAR(255), email NVARCHAR(255), jobTitle NVARCHAR(255), companyName NVARCHAR(255), companySize NVARCHAR(255), industry NVARCHAR(255), location NVARCHAR(255), betaTesting BIT, diversitySupplier BIT)', (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Table "users" created successfully');
    }
  });
});

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
  const existingUser = await connection.query('SELECT * FROM users WHERE email = @email', { email: userData.email });
  if (existingUser[0].length > 0) {
    return res.status(409).send('User with this email already exists');
  }

  // Insert new user data into the SQL Server database
  const newUser = await connection.query('INSERT INTO users (name, email, jobTitle, companyName, companySize, industry, location, betaTesting, diversitySupplier) VALUES (@name, @email, @jobTitle, @companyName, @companySize, @industry, @location, @betaTesting, @diversitySupplier)', {
    name: userData.name,
    email: userData.email,
    jobTitle: userData.jobTitle,
    companyName: userData.companyName,
    companySize: userData.companySize,
    industry: userData.industry,
    location: userData.location,
    betaTesting: userData.betaTesting,
    diversitySupplier: userData.diversitySupplier
  });

  // Send a success response
  res.status(201).send('User successfully registered');
});

// Start the server
app.listen(3000, () => console.log('Server started on port 3000'));



