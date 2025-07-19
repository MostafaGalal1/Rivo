// src/config/aws.js
const AWS = require('aws-sdk');
require('dotenv').config();  // Load environment variables from .env file

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const textract = new AWS.Textract();
module.exports = textract;