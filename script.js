// ========================================
// 1. КОПИРОВАНИЕ НОМЕРОВ ТЕЛЕФОНА
// ========================================
function setupClipboard(buttonId, toastId, errorMsg) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const phoneNumber = this.getAttribute('data-phone');

        navigator.clipboard.writeText(phoneNumber)
            .then(() => {
                const toast = document.getElementById(toastId);
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 2000);
                }
            })
            .catch(err => console.error(errorMsg, err));
    });
}

setupClipboard('phoneBtn', 'copyToast', 'Ошибка копирования основного номера');
setupClipboard('contactPhoneBtn', 'contactCopyToast', 'Ошибка копирования контактного номера');


// ========================================
// 2. СЛАЙДЕР — ИНИЦИАЛИЗАЦИЯ
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const tape = document.getElementById('sliderTape');
    if (!tape) return;

    // Получаем оригинальные слайды
    const originalSlides = Array.from(tape.querySelectorAll('.second-section'));
    const totalOriginals = originalSlides.length;
    if (totalOriginals === 0) return;

    // Создаем клоны для бесконечной прокрутки
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[totalOriginals - 1].cloneNode(true);

    tape.appendChild(firstClone);
    tape.insertBefore(lastClone, originalSlides[0]);

    // Теперь слайдов на 2 больше (клон в начале и в конце)
    const allSlides = tape.querySelectorAll('.second-section');

    let currentIndex = 1; // Начинаем с первого реального слайда (0 — это клон последнего)
    let isAnimating = false;

    // ========================================
    // 3. ФУНКЦИИ УПРАВЛЕНИЯ СЛАЙДЕРОМ
    // ========================================

    // Получаем точную ширину одного слайда
    function getSlideWidth() {
        // Берем ширину первого РЕАЛЬНОГО слайда (индекс 1), чтобы избежать ошибок округления
        return allSlides[1].getBoundingClientRect().width;
    }

    // Перемещение ленты слайдера
    function updateSlider(animate = true) {
        const width = getSlideWidth();
        const offset = -currentIndex * width;

        if (animate) {
            // Ускоренная анимация (0.3s) для более "пружинистого" ощущения на мобилке
            tape.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            isAnimating = true;
        } else {
            tape.style.transition = 'none';
        }

        tape.style.transform = `translateX(${offset}px)`;
    }

    // ========================================
    // 4. БЕСШОВНЫЙ ЦИКЛ (прыжок на границах)
    // ========================================
    tape.addEventListener('transitionend', () => {
        isAnimating = false;

        // Если уехали на клон первого слайда -> прыгаем на реальный первый
        if (currentIndex === totalOriginals + 1) {
            currentIndex = 1;
            updateSlider(false);
        }
        // Если уехали на клон последнего слайда -> прыгаем на реальный последний
        else if (currentIndex === 0) {
            currentIndex = totalOriginals;
            updateSlider(false);
        }
    });

    // ========================================
    // 5. КНОПКИ ВПЕРЕД / НАЗАД
    // ========================================
    const nextBtn = document.querySelector('.slider-next');
    const prevBtn = document.querySelector('.slider-prev');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (isAnimating) return;
            currentIndex++;
            updateSlider(true);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (isAnimating) return;
            currentIndex--;
            updateSlider(true);
        });
    }

    // ========================================
    // 6. СВАЙПЫ ДЛЯ ТЕЛЕФОНА (ПОВЫШЕННАЯ ЧУВСТВИТЕЛЬНОСТЬ)
    // ========================================
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasMoved = false; // Флаг, чтобы отличить тап от свайпа

    tape.addEventListener('touchstart', (e) => {
        if (isAnimating) return;
        isDragging = true;
        hasMoved = false;
        startX = e.touches[0].clientX;
        currentX = startX;
        tape.style.transition = 'none'; // Мгновенная реакция на палец
    }, { passive: true });

    tape.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        hasMoved = true;

        const diff = currentX - startX;
        const width = getSlideWidth();
        // Двигаем ленту вслед за пальцем
        tape.style.transform = `translateX(${-currentIndex * width + diff}px)`;
    }, { passive: true });

    tape.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;

        const diff = currentX - startX;

        // ПОРОГ СРАБАТЫВАНИЯ: 25px — высокая чувствительность
        // Если нужно ещё чувствительнее — поставьте 15, если слишком резко — верните 35-40
        const threshold = 25;

        if (hasMoved) {
            if (diff < -threshold) {
                // Свайп влево -> следующий слайд
                currentIndex++;
            } else if (diff > threshold) {
                // Свайп вправо -> предыдущий слайд
                currentIndex--;
            }
        }

        // Возвращаем слайд на место с плавной анимацией
        updateSlider(true);
    });

    tape.addEventListener('touchcancel', () => {
        if (!isDragging) return;
        isDragging = false;
        updateSlider(true);
    });

    // ========================================
    // 7. СВАЙПЫ МЫШЬЮ (для удобного тестирования на ПК)
    // ========================================
    let mouseStartX = 0;
    let mouseCurrentX = 0;
    let isMouseDragging = false;

    tape.addEventListener('mousedown', (e) => {
        if (isAnimating) return;
        isMouseDragging = true;
        mouseStartX = e.clientX;
        mouseCurrentX = e.clientX;
        tape.style.transition = 'none';
        tape.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDragging) return;
        mouseCurrentX = e.clientX;
        const diff = mouseCurrentX - mouseStartX;
        const width = getSlideWidth();
        tape.style.transform = `translateX(${-currentIndex * width + diff}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (!isMouseDragging) return;
        isMouseDragging = false;
        tape.style.cursor = 'grab';

        const diff = mouseCurrentX - mouseStartX;
        const threshold = 25;

        if (Math.abs(diff) > threshold) {
            if (diff < 0) currentIndex++;
            else currentIndex--;
        }

        updateSlider(true);
    });

    // Курсор-подсказка, что слайдер можно тянуть
    tape.style.cursor = 'grab';

    // ========================================
    // 8. ИНИЦИАЛИЗАЦИЯ И ОБРАБОТКА RESIZE
    // ========================================

    // Стартовая позиция (небольшая задержка, чтобы CSS успел примениться)
    setTimeout(() => {
        updateSlider(false);
    }, 100);

    // Пересчет при повороте экрана или изменении размера окна
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateSlider(false);
        }, 150);
    });
});