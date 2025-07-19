// src/app.js
const express = require('express');
const bodyParser = require('body-parser');
const textractRoutes = require('./routes/texrtactRoutes');
require('dotenv').config();  // Load environment variables from .env file

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', textractRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});