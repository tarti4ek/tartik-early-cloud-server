// Tartik Early Cloud Server
const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const cron = require('node-cron');
const fs = require('fs');

// Загрузка service-account.json (положи его сюда же в эту директорию)
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Твой токен из приложения (мы отправляем пуши всем твоим клиентам через этот токен)
const registrationTokens = [
  'dmDVVuGTSg2OstZM3b5M2p:APA91bGliKDtMjdkEyCDPJjP_7TjnFQecetSzvXV-Vzvmli8yO4BG-5LZpFCU0VeA_QE_GNtaZyPQNntbyZjsk1F3NM-Eo7b3hwqbRsbIaGomtnsmhwBYCI'
];

// История тревог чтобы не дублировать
let alertHistory = new Set();

async function checkAlerts() {
  try {
    // ✅ Используем Israel Alerts Public API (ранние тревоги)
    const res = await axios.get('https://alerts-v2.pikudhaoref.org.il/api/alerts?limit=5');
    const data = res.data;

    for (let alert of data) {
      if (!alertHistory.has(alert.id)) {
        alertHistory.add(alert.id);

        console.log(`🔔 Новая тревога: ${alert.location} — ${alert.time}`);

        const message = {
          notification: {
            title: '🚨 РАННЕЕ ПРЕДУПРЕЖДЕНИЕ',
            body: `${alert.location} — Срочно укройтесь!`
          },
          tokens: registrationTokens
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log(`✅ Пуш отправлен: ${response.successCount} устройств`);
      }
    }
  } catch (err) {
    console.error('❌ Ошибка при получении тревог:', err.message);
  }
}

// Проверяем тревоги каждую минуту
cron.schedule('* * * * *', checkAlerts);

app.get('/', (req, res) => {
  res.send('Tartik Early Cloud Server is working!');
});

app.listen(PORT, () => {
  console.log(`🌐 Tartik Early Cloud Server запущен на порту ${PORT}`);
});
