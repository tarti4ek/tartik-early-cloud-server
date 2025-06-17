const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

// Загружаем наш сервисный аккаунт
const serviceAccount = require('./service-account.json');

// Инициализируем firebase-admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Tartik Early Cloud Server работает");
});

app.get("/test", async (req, res) => {
  const registrationToken = 'ТВОЙ_РЕАЛЬНЫЙ_FCM_ТОКЕН';  // сюда вставь свой токен

  const message = {
    notification: {
      title: "🚨 Тест сирены",
      body: "Это тестовое уведомление от Tartik Early Cloud Server"
    },
    token: registrationToken
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Уведомление успешно отправлено:", response);
    res.send("✅ Уведомление успешно отправлено");
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    res.send("❌ Ошибка при отправке");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Tartik Early Cloud Server запущен на порту ${PORT}`);
});
