// src/routes/textractRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer'); // Import multer middleware
const { analyzeDocument } = require('../controllers/textractController');

// POST route for uploading the file
router.post('/upload', upload.single('file'), analyzeDocument);

module.exports = router;