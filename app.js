const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/words', async (req, res) => {
  try {
    const [words] = await pool.query('SELECT * FROM words');
    res.json(words);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/words/:id', async (req, res) => {
  try {
    const [word] = await pool.query(
      'SELECT * FROM words WHERE id = ?', 
      [req.params.id]
    );
    
    if (word.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }
    
    res.json(word[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/words', async (req, res) => {
  const { english_word, korean_word, part_of_speech } = req.body;
  
  if (!english_word || !korean_word) {
    return res.status(400).json({ 
      error: 'English and Korean words are required' 
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO words (english_word, korean_word, part_of_speech) VALUES (?, ?, ?)',
      [english_word, korean_word, part_of_speech || 'noun']
    );
    
    const [newWord] = await pool.query(
      'SELECT * FROM words WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newWord[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});