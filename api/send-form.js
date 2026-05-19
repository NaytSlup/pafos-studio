// Замените эти данные на свои реальные значения
const TG_TOKEN = '8355809233:AAEFVYvgGUS10yD40zBJVHQdx7ziza54NBU';
const TG_CHAT_ID = '420129066';

// Собираем текст сообщения для Telegram
const messageText = `🔔 *Новая заявка с сайта!* \n\n` +
                    `👤 *Имя:* ${data.name || '—'}\n` +
                    `📞 *Телефон:* ${data.phone || '—'}\n` +
                    `💬 *Telegram / WA:* ${data.social || '—'}\n` +
                    `📝 *О себе:* ${data.about || '—'}`;

// Отправляем запрос напрямую в API Telegram
fetch(`https://telegram.org{TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: messageText,
        parse_mode: 'Markdown' // Чтобы применить жирный шрифт к заголовкам
    })
})
.then(response => response.json())
.then(result => {
    if (result.ok) {
        alert('Заявка успешно отправлена!');
        // Здесь можно очистить форму или закрыть модальное окно
    } else {
        console.error('Ошибка Telegram API:', result);
        alert('Произошла ошибка при отправке.');
    }
})
.catch(error => {
    console.error('Ошибка сети:', error);
    alert('Не удалось связаться с сервером.');
});
