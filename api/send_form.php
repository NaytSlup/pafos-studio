<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['ok' => true]);
    exit(0);
}

// ===== ЗАГРУЗКА .env =====
$env_path = __DIR__ . '/.env';
if (file_exists($env_path)) {
    $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

$gmail_user = $_ENV['GMAIL_USER'] ?? null;
$gmail_pass = $_ENV['GMAIL_PASS'] ?? null;
$mail_to = $_ENV['MAIL_TO'] ?? null;

try {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data) {
        throw new Exception('Нет данных запроса');
    }

    $name = $data['name'] ?? '—';
    $phone = $data['phone'] ?? '—';
    $social = $data['social'] ?? '—';
    $about = $data['about'] ?? '—';

    // Формируем тему и тело письма
    $subject = '=?UTF-8?B?' . base64_encode('🔔 Новая заявка с сайта PAFOS') . '?=';
    
    $html_body = "
    <h2 style=\"color:#1a1a2e\">Новая заявка с сайта!</h2>
    <table style=\"border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px\">
        <tr><td style=\"padding:6px 12px;color:#888\">👤 Имя</td><td style=\"padding:6px 12px\"><b>{$name}</b></td></tr>
        <tr><td style=\"padding:6px 12px;color:#888\">📞 Телефон</td><td style=\"padding:6px 12px\"><b>{$phone}</b></td></tr>
        <tr><td style=\"padding:6px 12px;color:#888\">💬 Telegram / WhatsApp</td><td style=\"padding:6px 12px\">{$social}</td></tr>
        <tr><td style=\"padding:6px 12px;color:#888\">📝 О себе</td><td style=\"padding:6px 12px\">{$about}</td></tr>
    </table>";

    // Настройка заголовков для отправки HTML-письма
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";
    $headers .= "From: <{$gmail_user}>\r\n";
    $headers .= "Reply-To: <{$gmail_user}>\r\n";

    // Отправка через стандартную функцию mail() хостинга Reg.ru
    // На серверах Reg.ru она отлично работает и шлет письма без внешней авторизации
    if (mail($mail_to, $subject, $html_body, $headers)) {
        echo json_encode(['ok' => true]);
    } else {
        throw new Exception('Встроенная функция mail() вернула false');
    }

} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>