<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {

    // Получаем JSON
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data) {
        throw new Exception('Нет данных');
    }

    // Защита от пустых полей
    $name = trim($data['name'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $social = trim($data['social'] ?? '');
    $about = trim($data['about'] ?? '');

    if (!$name && !$phone) {
        throw new Exception('Заполните имя или телефон');
    }

    // Куда отправляем
    $to = 'hello@pafos-studio.ru';

    // Тема
    $subject = 'Новая заявка с сайта PAFOS';

    // HTML письмо
    $message = '
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
        
        <div style="
            max-width:600px;
            margin:0 auto;
            background:#ffffff;
            border-radius:12px;
            padding:30px;
            box-shadow:0 2px 10px rgba(0,0,0,0.08);
        ">
            
            <h2 style="margin-top:0;color:#111;">
                🔔 Новая заявка с сайта
            </h2>

            <table style="width:100%;border-collapse:collapse;">

                <tr>
                    <td style="padding:10px 0;color:#777;width:180px;">
                        👤 Имя
                    </td>
                    <td style="padding:10px 0;">
                        <strong>' . htmlspecialchars($name) . '</strong>
                    </td>
                </tr>

                <tr>
                    <td style="padding:10px 0;color:#777;">
                        📞 Телефон
                    </td>
                    <td style="padding:10px 0;">
                        <strong>' . htmlspecialchars($phone) . '</strong>
                    </td>
                </tr>

                <tr>
                    <td style="padding:10px 0;color:#777;">
                        💬 Telegram / WhatsApp
                    </td>
                    <td style="padding:10px 0;">
                        ' . htmlspecialchars($social) . '
                    </td>
                </tr>

                <tr>
                    <td style="padding:10px 0;color:#777;vertical-align:top;">
                        📝 О себе
                    </td>
                    <td style="padding:10px 0;">
                        ' . nl2br(htmlspecialchars($about)) . '
                    </td>
                </tr>

            </table>

        </div>

    </body>
    </html>
    ';

    // Заголовки
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-type: text/html; charset=UTF-8';
    $headers[] = 'From: PAFOS Studio <no-reply@pafos-studio.ru>';
    $headers[] = 'Reply-To: no-reply@pafos-studio.ru';
    $headers[] = 'X-Mailer: PHP/' . phpversion();

    // Отправка
    $success = mail(
        $to,
        '=?UTF-8?B?' . base64_encode($subject) . '?=',
        $message,
        implode("\r\n", $headers)
    );

    if (!$success) {
        throw new Exception('Не удалось отправить письмо');
    }

    echo json_encode([
        'ok' => true
    ]);

} catch (Exception $e) {

    http_response_code(400);

    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}