// functions/send-form.js
export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS preflight обрабатывать вручную в Pages обычно не нужно, 
    // так как запрос идет на тот же домен, но для надежности заголовки можно оставить

    let data;
    try {
        data = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const text = `<b>Новая заявка с сайта!</b>\n\n👤 Имя: ${data.name || '—'}\n📞 Телефон: ${data.phone || '—'}\n💬 Telegram / WhatsApp: ${data.social || '—'}\n📝 Обо мне: ${data.about || '—'}`;
    
    try {
        const tgRes = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text, parse_mode: 'HTML' })
        });

        const tgData = await tgRes.json();

        return new Response(JSON.stringify({ ok: true, tg: tgData }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}