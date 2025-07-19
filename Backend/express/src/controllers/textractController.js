// src/controllers/textractController.js
const textract = require('../config/aws');

// Function to process the uploaded file with AWS Textract
const analyzeDocument = (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  const params = {
    Document: {
      Bytes: file.buffer, // Send the image file as buffer to Textract
    },
    FeatureTypes: ['TABLES', 'FORMS'], // You can customize the features you need
  };

  textract.analyzeDocument(params, (err, data) => {
    if (err) {
      console.error('Error processing document:', err);
      return res.status(500).send({ error: 'Error processing document' });
    }

    const resultText = extractTextFromTextractResult(data);
    res.json({ result: resultText });
  });
};

// Helper function to extract text from Textract response
function extractTextFromTextractResult(data) {
  let resultText = '';

  if (data.Blocks) {
    data.Blocks.forEach((block) => {
      if (block.BlockType === 'LINE') {
        resultText += block.Text + '\n';
      }
    });
  }

  return resultText;
}

module.exports = {
  analyzeDocument,
};