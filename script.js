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

    document.getElementById('daysVal').innerText = d;
    document.getElementById('hoursVal').innerText = h;
    document.getElementById('langVal').innerText = l;

    const baseHourly = 357.5;
    const langMult = 1 + (l - 1) * 0.1;

    const week = Math.round(d * h * baseHourly * langMult);
    const month = week * 4;
    const year = month * 12;

    document.getElementById('resWeek').innerText = week.toLocaleString() + ' ₽';
    document.getElementById('resMonth').innerText = month.toLocaleString() + ' ₽';
    document.getElementById('resYear').innerText = year.toLocaleString() + ' ₽';
}

inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateCalc);
});

// ===== МАСКА ТЕЛЕФОНА =====
const phoneEl = document.querySelector('[name="phone"]');
if (phoneEl) {
    IMask(phoneEl, {
        mask: '+{7} (000) 000-00-00'
    });
}

// ===== ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ =====
const form = document.querySelector('.main-form');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nameInput  = this.querySelector('[name="name"]');
        const phoneInput = this.querySelector('[name="phone"]');
        const btn        = this.querySelector('.submit-btn');

        clearError(nameInput);
        clearError(phoneInput);

        let valid = true;

        if (!nameInput || nameInput.value.trim().length < 2) {
            showError(nameInput, 'Введите ваше имя');
            valid = false;
        }

        if (!phoneInput || phoneInput.value.replace(/\D/g, '').length < 11) {
            showError(phoneInput, 'Введите полный номер телефона');
            valid = false;
        }

        if (!valid) return;

        btn.disabled = true;
        const originalBtnText = btn.textContent;
        btn.textContent = 'Отправка...';

        try {
            const res = await fetch('/api/send_form.py.py', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:   nameInput.value.trim(),
                    phone:  phoneInput.value.trim(),
                    social: this.querySelector('[name="social"]').value.trim(),
                    about:  this.querySelector('[name="about"]').value.trim()
                })
            });

            const result = await res.json();

            if (res.ok && result.ok) {
                btn.textContent = '✅ Анкета отправлена!';
                btn.style.background = '#1a8a6e';
                this.reset();
                phoneInput.dispatchEvent(new Event('input'));
            } else {
                throw new Error(result.error || 'Server error');
            }
        } catch (err) {
            console.error('Ошибка отправки формы:', err);
            btn.textContent = '❌ Ошибка, попробуйте снова';
            btn.style.background = '#d93838';

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalBtnText;
                btn.style.background = '';
            }, 4000);
        }
    });
}

function showError(input, message) {
    if (!input) return;
    input.classList.add('input--error');
    const nextEl = input.nextElementSibling;
    if (nextEl && nextEl.classList.contains('input-error-msg')) return;
    const err = document.createElement('span');
    err.className = 'input-error-msg';
    err.textContent = message;
    input.insertAdjacentElement('afterend', err);
}

function clearError(input) {
    if (!input) return;
    input.classList.remove('input--error');
    const msg = input.nextElementSibling;
    if (msg && msg.classList.contains('input-error-msg')) {
        msg.remove();
    }
}

updateCalc();