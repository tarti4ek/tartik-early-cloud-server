// server.js
const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 10000;

// 🔐 Загрузка service-account из переменной среды
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

let lastAlertId = null;

// Отправка push-уведомления
async function sendPushNotification(title, body) {
  const message = {
    notification: {
      title,
      body,
    },
    topic: 'sirens',
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        visibility: 'public',
        channelId: 'sirens_channel',
      },
    },
  };

  try {
    await messaging.send(message);
    console.log('✅ Отправлено уведомление:', title, '-', body);
  } catch (error) {
    console.error('❌ Ошибка при отправке уведомления:', error);
  }
}

// Получение данных от Пикуд Ореф
async function checkForAlerts() {
  try {
    const response = await axios.get('https://www.oref.org.il/WarningMessages/alert/alerts.json', {
      headers: {
        Referer: 'https://www.oref.org.il/',
        'User-Agent': 'Mozilla/5.0',
      },
      params: {
        time: Date.now(),
      },
    });

    const data = response.data;

    if (data && data.id !== lastAlertId && data.data && data.data.length > 0) {
      lastAlertId = data.id;
      const cities = data.data.join(', ');

      const isEarly = data.desc?.includes('מוקדמת') || false;
      const title = isEarly ? 'Раннее предупреждение' : 'Воздушная тревога';
      const body = isEarly
        ? `В ближайшие минуты в городах: ${cities} ожидается сирена!`
        : `Воздушная тревога в городах: ${cities}`;

      await sendPushNotification(title, body);
    }
  } catch (err) {
    console.error('❌ Ошибка при проверке тревог:', err.message);
  }
}

// Запуск проверки тревог каждые 30 секунд
cron.schedule('*/30 * * * * *', checkForAlerts);

// Тестовая страница
app.get('/', (req, res) => {
  res.send('🚀 Tartik Early Cloud Server запущен');
});

app.listen(PORT, () => {
  console.log(`🚀 Tartik Early Cloud Server запущен на порту ${PORT}`);
});
