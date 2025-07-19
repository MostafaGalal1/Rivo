// src/middlewares/multer.js
const multer = require('multer');

// Set up multer storage (in memory storage for simplicity)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;