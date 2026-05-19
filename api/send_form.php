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
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }
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

    if (!$gmail_user || !$gmail_pass || !$mail_to) {
        throw new Exception('В .env файле не заполнены данные для Gmail SMTP');
    }

    $name = $data['name'] ?? '—';
    $phone = $data['phone'] ?? '—';
    $social = $data['social'] ?? '—';
    $about = $data['about'] ?? '—';

    // Формируем тему и HTML-тело
    $subject = '🔔 Новая заявка с сайта PAFOS';
    $html_body = "
    <h2 style=\"color:#1a1a2e\">Новая заявка с сайта!</h2>
    <table style=\"border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px\">
        <tr><td style=\"padding:6px 12px;color:#888\">👤 Имя</td><td style=\"padding:6px 12px\"><b>{$name}</b></td></tr>
        <tr><td style=\"padding:6px 12px;color:#888\">📞 Телефон</td><td style=\"padding:6px 12px\"><b>{$phone}</b></td></tr>
        <tr><td style=\"padding:6px 12px;color:#888\">💬 Telegram / WhatsApp</td><td style=\"padding:6px 12px\">{$social}</td></tr>
        <tr><td style=\"padding:6px 12px;color:#888\">📝 О себе</td><td style=\"padding:6px 12px\">{$about}</td></tr>
    </table>";

    // ===== ОТПРАВКА ЧЕРЕЗ SMTP GMAIL =====
    send_smtp_gmail($gmail_user, $gmail_pass, $mail_to, $subject, $html_body);
    
    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

// Функция для отправки почты через сокеты по протоколу SMTP
function send_smtp_gmail($user, $pass, $to, $subject, $body) {
    $socket = stream_socket_client('ssl://smtp.gmail.com:465', $errno, $errstr, 15);
    if (!$socket) {
        throw new Exception("Не удалось подключиться к SMTP Google: $errstr ($errno)");
    }

    function read_socket($socket, $expected) {
        $server_response = '';
        while (strpos($server_response, "\r\n") === false || $server_response[3] === '-') {
            $line = fgets($socket, 512);
            if ($line === false) break;
            $server_response .= $line;
        }
        if (intval($server_response) !== $expected) {
            throw new Exception("Ошибка SMTP: Измените пароль приложения или проверьте доступы. Ответ сервера: " . trim($server_response));
        }
    }

    read_socket($socket, 220);
    
    fwrite($socket, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
    read_socket($socket, 250);

    fwrite($socket, "AUTH LOGIN\r\n");
    read_socket($socket, 334);

    fwrite($socket, base64_encode($user) . "\r\n");
    read_socket($socket, 334);

    fwrite($socket, base64_encode($pass) . "\r\n");
    read_socket($socket, 235);

    fwrite($socket, "MAIL FROM: <$user>\r\n");
    read_socket($socket, 250);

    fwrite($socket, "RCPT TO: <$to>\r\n");
    read_socket($socket, 250);

    fwrite($socket, "DATA\r\n");
    read_socket($socket, 354);

    $encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";
    $headers .= "To: <$to>\r\n";
    $headers .= "From: PAFOS Studio <$user>\r\n";
    $headers .= "Subject: $encoded_subject\r\n\r\n";

    fwrite($socket, $headers . $body . "\r\n.\r\n");
    read_socket($socket, 250);

    fwrite($socket, "QUIT\r\n");
    fclose($socket);
}
?>