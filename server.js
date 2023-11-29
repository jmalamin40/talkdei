
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const Joi = require('joi');

const app = express();
const port = 3000;

// MSSQL Configuration
const config = {
  user: 'talkdeiuser',
  password: '6;MU7`ND6a',
  server: 'talkdeitest.database.windows.net',
  database: 'talkdeitest',
  options: {
    encrypt: true, // Use this if you're on Windows Azure
  },
};

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Define Joi schema for data validation
const dataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  jobTitle: Joi.string().required(),
  companyName: Joi.string().required(),
  companySize: Joi.string().required(),
  industry: Joi.string().required(),
  location: Joi.string().required(),
  betaTesting: Joi.string().required(),
  diversitySupplier: Joi.string().required(),
});

app.post('/api/data', async (req, res) => {
  try {
    // Validate the incoming data
    const { error, value } = dataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Connect to the MSSQL database
    await sql.connect(config);

    // Insert data into the database
    const result = await new sql.Request().input('name', sql.NVarChar, value.name)
      .input('email', sql.NVarChar, value.email)
      .input('jobTitle', sql.NVarChar, value.jobTitle)
      .input('companyName', sql.NVarChar, value.companyName)
      .input('companySize', sql.NVarChar, value.companySize)
      .input('industry', sql.NVarChar, value.industry)
      .input('location', sql.NVarChar, value.location)
      .input('betaTesting', sql.NVarChar, value.betaTesting)
      .input('diversitySupplier', sql.NVarChar, value.diversitySupplier)
      .query(`
        INSERT INTO users (name, email, jobTitle, companyName, companySize, industry, location, betaTesting, diversitySupplier)
        VALUES (@name, @email, @jobTitle, @companyName, @companySize, @industry, @location, @betaTesting, @diversitySupplier)
      `);

    // Close the MSSQL connection
    await sql.close();

    console.log('Data inserted successfully:', value);

    res.json({ message: 'Data received and inserted successfully', data: value });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

