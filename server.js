const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;
const TIMEOUT = 500;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const urlArray = Array.isArray(urls) ? urls : [urls];

  try {
    const responses = await Promise.allSettled(
      urlArray.map(async (url) => {
        try {
          const { data } = await axios.get(url, { timeout: TIMEOUT });
          return data.numbers || [];
        } catch (error) {
          console.error(`Error retrieving numbers from ${url}:`, error.message);
          return [];
        }
      })
    );

    const numbers = responses
      .filter((response) => response.status === 'fulfilled')
      .flatMap((response) => response.value)
      .filter((number, index, self) => self.indexOf(number) === index)
      .sort((a, b) => a - b);

    res.json({ numbers });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define test server APIs
app.get('/numbers/primes', (req, res) => {
  res.json({
    numbers: [2, 3, 5, 7, 11, 13, 17, 19, 23]
  });
});

app.get('/numbers/fibo', (req, res) => {
  res.json({
    numbers: [1, 2, 3, 5, 8, 13, 21, 34, 55]
  });
});

app.get('/numbers/odd', (req, res) => {
  res.json({
    numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
