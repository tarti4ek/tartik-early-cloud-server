const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// Получаем из Render переменную
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Tartik Early Cloud Server работает!');
});

// Тут позже подключим основную логику

app.listen(PORT, () => {
  console.log(`🚀 Tartik Early Cloud Server запущен на порту ${PORT}`);
});
