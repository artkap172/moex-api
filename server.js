const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let cache = null;
let cacheTime = null;

app.get('/api/moex', async (req, res) => {
  try {
    const now = Date.now();
    if (cache && cacheTime && (now - cacheTime) < 60000) {
      return res.json(cache);
    }

    const response = await fetch(
      'https://iss.moex.com/iss/engines/futures/markets/forts/securities.json',
      { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    
    const data = await response.json();
    cache = data;
    cacheTime = now;
    
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log('Running on ' + PORT));
