const inputs = ['days', 'hours', 'lang'];
const vals = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    lang: document.getElementById('lang')
};

function updateCalc() {
    const d = parseInt(vals.days.value);
    const h = parseInt(vals.hours.value);
    const l = parseInt(vals.lang.value);

    // Обновляем текст ползунков
    document.getElementById('daysVal').innerText = d;
    document.getElementById('hoursVal').innerText = h;
    document.getElementById('langVal').innerText = l;

    // Базовая ставка (рассчитана из ваших 14300 за 5д/8ч)
    const baseHourly = 357.5;
    
    // Коэффициент за английский (каждый уровень +10% к доходу)
    const langMult = 1 + (l - 1) * 0.1;

    const week = Math.round(d * h * baseHourly * langMult);
    const month = week * 4;
    const year = month * 12;

    document.getElementById('resWeek').innerText = week.toLocaleString() + ' ₽';
    document.getElementById('resMonth').innerText = month.toLocaleString() + ' ₽';
    document.getElementById('resYear').innerText = year.toLocaleString() + ' ₽';
}

inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', updateCalc);
});

// ===== МАСКА ТЕЛЕФОНА =====
IMask(document.querySelector('[name="phone"]'), {
    mask: '+{7} (000) 000-00-00'
});

// ===== ВАЛИДАЦИЯ ФОРМЫ =====
document.querySelector('.main-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nameInput  = this.querySelector('[name="name"]');
    const phoneInput = this.querySelector('[name="phone"]');
    const btn        = this.querySelector('.submit-btn');

    // Сброс ошибок
    clearError(nameInput);
    clearError(phoneInput);

    let valid = true;

    // Проверка имени
    if (nameInput.value.trim().length < 2) {
        showError(nameInput, 'Введите ваше имя');
        valid = false;
    }

    // Проверка телефона — маска даёт ровно 18 символов
    if (phoneInput.value.replace(/\D/g, '').length < 11) {
        showError(phoneInput, 'Введите полный номер телефона');
        valid = false;
    }

    if (!valid) return;

    btn.disabled = true;
    btn.textContent = 'Отправка...';

    try {
        const res = await fetch('/send-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name:   nameInput.value.trim(),
                phone:  phoneInput.value.trim(),
                social: this.querySelector('[name="social"]').value.trim(),
                about:  this.querySelector('[name="about"]').value.trim()
            })
        });

        if (res.ok) {
            btn.textContent = '✅ Анкета отправлена!';
            btn.style.background = '#1a8a6e';
            this.reset();
            // Сброс маски после reset()
            phoneInput.dispatchEvent(new Event('input'));
        } else {
            throw new Error();
        }
    } catch {
        btn.textContent = '❌ Ошибка, попробуйте снова';
        btn.disabled = false;
    }
});

function showError(input, message) {
    input.classList.add('input--error');
    const err = document.createElement('span');
    err.className = 'input-error-msg';
    err.textContent = message;
    input.insertAdjacentElement('afterend', err);
}

function clearError(input) {
    input.classList.remove('input--error');
    const msg = input.parentElement.querySelector('.input-error-msg');
    if (msg) msg.remove();
}

// Инициализация при загрузке
updateCalc();