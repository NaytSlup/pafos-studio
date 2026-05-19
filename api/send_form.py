#!/opt/python/python-3.8.8/bin/python
# -*- coding: utf-8 -*-

import json
import os
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ===== ЗАГРУЗКА .env =====
def load_env(path='.env'):
    env_path = os.path.join(os.path.dirname(__file__), path)
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

GMAIL_USER = os.environ.get('GMAIL_USER')
GMAIL_PASS = os.environ.get('GMAIL_PASS')
MAIL_TO    = os.environ.get('MAIL_TO')

# ===== ЗАГОЛОВКИ CGI =====
print("Content-Type: application/json; charset=utf-8")
print("Access-Control-Allow-Origin: *")
print("Access-Control-Allow-Methods: POST, OPTIONS")
print("Access-Control-Allow-Headers: Content-Type")
print()

if os.environ.get('REQUEST_METHOD') == 'OPTIONS':
    print(json.dumps({"ok": True}))
    sys.exit(0)

try:
    raw = sys.stdin.read()
    data = json.loads(raw)

    name   = data.get('name', '—')
    phone  = data.get('phone', '—')
    social = data.get('social', '—')
    about  = data.get('about', '—')

    html_body = f"""
    <h2 style="color:#1a1a2e">Новая заявка с сайта!</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
        <tr><td style="padding:6px 12px;color:#888">👤 Имя</td>
            <td style="padding:6px 12px"><b>{name}</b></td></tr>
        <tr><td style="padding:6px 12px;color:#888">📞 Телефон</td>
            <td style="padding:6px 12px"><b>{phone}</b></td></tr>
        <tr><td style="padding:6px 12px;color:#888">💬 Telegram / WhatsApp</td>
            <td style="padding:6px 12px">{social}</td></tr>
        <tr><td style="padding:6px 12px;color:#888">📝 О себе</td>
            <td style="padding:6px 12px">{about}</td></tr>
    </table>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = '🔔 Новая заявка с сайта PAFOS'
    msg['From']    = GMAIL_USER
    msg['To']      = MAIL_TO
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(GMAIL_USER, GMAIL_PASS)
        server.sendmail(GMAIL_USER, MAIL_TO, msg.as_string())

    print(json.dumps({"ok": True}))

except Exception as e:
    print(json.dumps({"ok": False, "error": str(e)}))