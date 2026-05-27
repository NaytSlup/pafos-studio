document.addEventListener("DOMContentLoaded", function () {

    // ===== КАЛЬКУЛЯТОР =====
    const daysInput = document.getElementById('days');
    const hoursInput = document.getElementById('hours');
    const langInput = document.getElementById('lang');

    function updateCalc() {
        const d = parseInt(daysInput.value) || 0;
        const h = parseInt(hoursInput.value) || 0;
        const l = parseInt(langInput.value) || 1;

        // Обновляем подписи
        document.getElementById('daysVal').innerText = d;
        document.getElementById('hoursVal').innerText = h;
        document.getElementById('langVal').innerText = l;

        // 🔥 ФОРМУЛА С УВЕЛИЧЕННЫМ ДОХОДОМ
        const baseHourly = 1800;              // базовая ставка за час (было 357 → 1800)
        const langMult = 1 + (l - 1) * 0.4;   // множитель за английский (1 → 2.6)
        const incomeMultiplier = 2.8;         // дополнительный множитель

        let week = d * h * baseHourly * langMult * incomeMultiplier;
        let month = week * 4.3;               // среднее число недель в месяце
        let year = week * 52;                 // 52 недели в году

        document.getElementById('resWeek').innerText = Math.round(week).toLocaleString('ru-RU') + ' ₽';
        document.getElementById('resMonth').innerText = Math.round(month).toLocaleString('ru-RU') + ' ₽';
        document.getElementById('resYear').innerText = Math.round(year).toLocaleString('ru-RU') + ' ₽';
    }

    // Навешиваем обработчики
    if (daysInput) daysInput.addEventListener('input', updateCalc);
    if (hoursInput) hoursInput.addEventListener('input', updateCalc);
    if (langInput) langInput.addEventListener('input', updateCalc);

    // Первоначальный расчёт
    updateCalc();

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
            const res = await fetch('/api/send_form.php', {
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
