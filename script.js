// ========================================
// 1. КОПИРОВАНИЕ НОМЕРОВ (Без изменений, работает отлично)
// ========================================
function setupClipboard(buttonId, toastId, errorMsg) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    btn.addEventListener('click', function (e) {
        e.preventDefault(); // Предотвращаем случайные переходы, если это ссылка
        const phoneNumber = this.getAttribute('data-phone');
        
        navigator.clipboard.writeText(phoneNumber).then(() => {
            const toast = document.getElementById(toastId);
            if (toast) {
                toast.classList.add('show');
                // Убираем класс через 2 секунды
                setTimeout(() => toast.classList.remove('show'), 2000);
            }
        }).catch(err => console.error(errorMsg, err));
    });
}

setupClipboard('phoneBtn', 'copyToast', 'Ошибка копирования основного номера');
setupClipboard('contactPhoneBtn', 'contactCopyToast', 'Ошибка копирования контактного номера');


// ========================================
// 2. ОПТИМИЗИРОВАННЫЙ СЛАЙДЕР (Быстрый и плавный)
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const tape = document.getElementById('sliderTape');
    if (!tape) return;

    // Получаем оригинальные слайды (без клонов пока)
    const originalSlides = Array.from(document.querySelectorAll('.second-section'));
    const totalOriginals = originalSlides.length;
    
    if (totalOriginals === 0) return;

    // Создаем клоны для бесконечной прокрутки
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[totalOriginals - 1].cloneNode(true);

    // Добавляем клоны в DOM
    tape.appendChild(firstClone);
    tape.insertBefore(lastClone, originalSlides[0]);

    // Обновляем список всех слайдов (теперь их больше на 2)
    const allSlides = tape.querySelectorAll('.second-section');
    let currentIndex = 1; // Начинаем с 1, так как 0 - это клон последнего слайда
    let isAnimating = false;
    
    // ВАЖНО: Ширина слайда теперь берется из CSS, а не вычисляется JS-ом динамически каждый раз.
    // Это решает проблему тормозов на телефоне.
    function getSlideWidth() {
        return allSlides[0].getBoundingClientRect().width;
    }

    function updateSlider(animate = true) {
        const width = getSlideWidth();
        const offset = -currentIndex * width;
        
        if (animate) {
            tape.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            isAnimating = true;
        } else {
            tape.style.transition = 'none';
        }
        
        tape.style.transform = `translateX(${offset}px)`;
    }

    // Обработка конца анимации (для бесшовного цикла)
    tape.addEventListener('transitionend', () => {
        isAnimating = false;
        const width = getSlideWidth();
        
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

    // Кнопки Вперед/Назад
    document.querySelector('.slider-next')?.addEventListener('click', () => {
        if (isAnimating) return;
        currentIndex++;
        updateSlider(true);
    });

    document.querySelector('.slider-prev')?.addEventListener('click', () => {
        if (isAnimating) return;
        currentIndex--;
        updateSlider(true);
    });

    // ========================================
    // 3. СВАЙПЫ ДЛЯ ТЕЛЕФОНА (Упрощенная логика)
    // ========================================
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    tape.addEventListener('touchstart', (e) => {
        if (isAnimating) return; // Блокируем свайп во время анимации
        isDragging = true;
        startX = e.touches[0].clientX;
        tape.style.transition = 'none'; // Отключаем плавность для мгновенной реакции пальца
    }, { passive: true });

    tape.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        const width = getSlideWidth();
        // Двигаем ленту вслед за пальцем
        tape.style.transform = `translateX(${-currentIndex * width + diff}px)`;
    }, { passive: true });

    tape.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        const threshold = 50; // Минимальное расстояние свайпа в пикселях
        
        if (diff < -threshold) {
            // Свайп влево -> следующий слайд
            currentIndex++;
        } else if (diff > threshold) {
            // Свайп вправо -> предыдущий слайд
            currentIndex--;
        }
        // Если свайп слишком короткий, остаемся на месте (ничего не делаем)
        
        updateSlider(true); // Возвращаем слайд на место с анимацией
    });

    // Инициализация при загрузке
    // Небольшая задержка гарантирует, что CSS стили применились
    setTimeout(() => {
        updateSlider(false);
    }, 100);

    // Пересчет при повороте экрана
    window.addEventListener('resize', () => {
        updateSlider(false);
    });
});