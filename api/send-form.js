// api/send-form.js — Vercel Serverless Function
// Отправляет данные формы на почту через SMTP (например, Gmail или Yandex)

const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Разрешаем только POST
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    let data;
    try {
        data = req.body;
        if (typeof data === 'string') data = JSON.parse(data);
    } catch (e) {
        return res.status(400).json({ ok: false, error: 'Invalid JSON' });
    }

    // Настройка транспорта — данные берутся из переменных окружения Vercel
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,       // например: smtp.yandex.ru или smtp.gmail.com
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,                       // true для порта 465, false для 587
        auth: {
            user: process.env.SMTP_USER,   // ваш email-логин
            pass: process.env.SMTP_PASS,   // пароль приложения (не основной пароль!)
        },
    });

    const mailOptions = {
        from: `"Сайт PAFOS" <${process.env.SMTP_USER}>`,
        to: process.env.MAIL_TO,           // куда приходят заявки
        subject: '🔔 Новая заявка с сайта Hey Girl',
        html: `
            <h2 style="color:#1a1a2e">Новая заявка с сайта!</h2>
            <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
                <tr><td style="padding:6px 12px;color:#888">👤 Имя</td>
                    <td style="padding:6px 12px"><b>${data.name || '—'}</b></td></tr>
                <tr><td style="padding:6px 12px;color:#888">📞 Телефон</td>
                    <td style="padding:6px 12px"><b>${data.phone || '—'}</b></td></tr>
                <tr><td style="padding:6px 12px;color:#888">💬 Telegram / WhatsApp</td>
                    <td style="padding:6px 12px">${data.social || '—'}</td></tr>
                <tr><td style="padding:6px 12px;color:#888">📝 О себе</td>
                    <td style="padding:6px 12px">${data.about || '—'}</td></tr>
            </table>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error('Mail error:', e);
        return res.status(500).json({ ok: false, error: e.message });
    }
}