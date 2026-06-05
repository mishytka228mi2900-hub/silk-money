// ========================================
// КОПИРОВАНИЕ НОМЕРОВ ТЕЛЕФОНА
// ========================================
function setupClipboard(buttonId, toastId, errorMsg) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', function () {
        const phoneNumber = this.getAttribute('data-phone');
        navigator.clipboard.writeText(phoneNumber).then(() => {
            const toast = document.getElementById(toastId);
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2000);
            }
        }).catch(err => console.error(errorMsg, err));
    });
}
setupClipboard('phoneBtn', 'copyToast', 'Не удалось скопировать: ');
setupClipboard('contactPhoneBtn', 'contactCopyToast', 'Не удалось скопировать номер: ');

// ========================================
// БЕСКОНЕЧНЫЙ СЛАЙДЕР С ПЛАВНЫМ СВАЙПОМ
// ========================================
const tape = document.getElementById('sliderTape');
const originalSlides = document.querySelectorAll('.second-section');
const totalSlides = originalSlides.length;

// Создаем клоны для бесконечного цикла
const firstClone = originalSlides[0].cloneNode(true);
const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

// Добавляем клоны в DOM
tape.appendChild(firstClone);
tape.insertBefore(lastClone, originalSlides[0]);

// Пересобираем массив слайдов с учетом клонов
const allSlides = tape.querySelectorAll('.second-section');

let currentIndex = 1; // Стартуем с 1, так как индекс 0 — это клон последнего слайда
let isTransitioning = false;

function getSlideWidth() {
    return originalSlides[0].offsetWidth;
}

// Установка начальной позиции без анимации
function setInitialPosition() {
    tape.style.transition = 'none';
    tape.style.transform = `translateX(${-currentIndex * getSlideWidth()}px)`;
}
setInitialPosition();

// Основная функция движения
function moveSlider(index, animated = true) {
    if (isTransitioning && animated) return;
    
    currentIndex = index;
    const slideWidth = getSlideWidth();
    
    if (animated) {
        tape.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'; // Плавная инерционная анимация
        isTransitioning = true;
    } else {
        tape.style.transition = 'none';
    }
    
    tape.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
}

// Корректировка позиции на границах клонов
tape.addEventListener('transitionend', () => {
    isTransitioning = false;
    
    if (currentIndex === 0) {
        moveSlider(totalSlides, false); // Мгновенный перенос в конец
    } else if (currentIndex === totalSlides + 1) {
        moveSlider(1, false); // Мгновенный перенос в начало
    }
});

// Кнопки управления
document.querySelectorAll('.slider-next').forEach(button => {
    button.addEventListener('click', () => {
        if (isTransitioning) return;
        moveSlider(currentIndex + 1);
    });
});

document.querySelectorAll('.slider-prev').forEach(button => {
    button.addEventListener('click', () => {
        if (isTransitioning) return;
        moveSlider(currentIndex - 1);
    });
});

window.addEventListener('resize', () => {
    moveSlider(currentIndex, false);
});

// ========================================
// УЛУЧШЕННЫЕ СВАЙПЫ (ПЛАВНЫЕ И СТАБИЛЬНЫЕ)
// ========================================
let touchStartX = 0;
let currentTranslate = 0;
let isDragging = false;

tape.addEventListener('touchstart', function(e) {
    if (isTransitioning) return;
    isDragging = true;
    touchStartX = e.touches[0].clientX;
    
    // Фиксируем текущую точку трансформации
    const slideWidth = getSlideWidth();
    currentTranslate = -currentIndex * slideWidth;
    
    tape.style.transition = 'none';
}, { passive: true });

tape.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const dragOffset = touchCurrentX - touchStartX;
    
    // Плавный сдвиг пальцем в реальном времени
    tape.style.transform = `translateX(${currentTranslate + dragOffset}px)`;
}, { passive: true });

tape.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const touchEndX = e.changedTouches[0].clientX;
    const dragOffset = touchEndX - touchStartX;
    const slideWidth = getSlideWidth();
    const threshold = slideWidth * 0.15; // Порог перелистывания (15% от ширины)

    if (dragOffset < -threshold) {
        // Свайп влево -> следующий слайд
        moveSlider(currentIndex + 1);
    } else if (dragOffset > threshold) {
        // Свайп вправо -> предыдущий слайд
        moveSlider(currentIndex - 1);
    } else {
        // Возврат на текущий слайд, если свайп был слишком слабым
        moveSlider(currentIndex);
    }
}, { passive: true });

tape.addEventListener('touchcancel', function() {
    if (!isDragging) return;
    isDragging = false;
    moveSlider(currentIndex);
}, { passive: true });
