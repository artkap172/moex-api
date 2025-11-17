const express = require('express');
const cors = require('cors');
const app = express();

// ВАЖНО: CORS ДОЛЖЕН БЫТЬ ВВЕРХУ!
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

let cache = null;
let cacheTime = null;

app.get('/api/moex', async (req, res) => {
  try {
    // CORS заголовки - добавляем явно
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    const now = Date.now();
    if (cache && cacheTime && (now - cacheTime) < 60000) {
      return res.json(cache);
    }

    console.log('📡 Запрос к MOEX ISS API...');
    
    const response = await fetch(
      'https://iss.moex.com/iss/engines/futures/markets/forts/securities.json',
      { 
        timeout: 15000, 
        headers: { 'User-Agent': 'Mozilla/5.0' } 
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    cache = data;
    cacheTime = now;
    
    console.log('✅ Данные получены с MOEX');
    return res.json(data);
    
  } catch (e) {
    console.error('❌ Ошибка:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// OPTIONS для CORS preflight
app.options('/api/moex', cors());

app.get('/health', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ ok: true });
});

app.listen(PORT, () => console.log('🚀 Running on ' + PORT));
