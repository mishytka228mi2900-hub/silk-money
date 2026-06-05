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
// ОПТИМИЗИРОВАННЫЙ БЕСКОНЕЧНЫЙ СЛАЙДЕР
// ========================================
const tape = document.getElementById('sliderTape');
const originalSlides = document.querySelectorAll('.second-section');
const totalSlides = originalSlides.length;

// Клонируем элементы для бесконечного цикла
const firstClone = originalSlides[0].cloneNode(true);
const lastClone = originalSlides[totalSlides - 1].cloneNode(true);
tape.appendChild(firstClone);
tape.insertBefore(lastClone, originalSlides);

let currentIndex = 1;
let isTransitioning = false;

// КЭШИРОВАНИЕ РАЗМЕРОВ (Убирает лаги и Layout Thrashing)
let slideWidth = originalSlides[0].offsetWidth;
function updateDimensions() {
    slideWidth = originalSlides[0].offsetWidth;
    moveSlider(currentIndex, false);
}

function moveSlider(index, animated = true) {
    if (isTransitioning && animated) return;
    
    currentIndex = index;
    
    if (animated) {
        tape.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'; // Ультра-плавная кривая скорости
        isTransitioning = true;
    } else {
        tape.style.transition = 'none';
    }
    
    tape.style.transform = `translate3d(${-currentIndex * slideWidth}px, 0, 0)`; // translate3d включает аппаратное ускорение видеокарты
}

// Мгновенный незаметный перенос на границах клонов
tape.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (currentIndex === 0) {
        moveSlider(totalSlides, false);
    } else if (currentIndex === totalSlides + 1) {
        moveSlider(1, false);
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

window.addEventListener('resize', updateDimensions);

// ========================================
// ВЫСОКОПРОИЗВОДИТЕЛЬНЫЕ СВАЙПЫ (120 FPS)
// ========================================
let touchStartX = 0;
let currentTranslate = 0;
let isDragging = false;
let dragOffset = 0;
let animationFrameId = null;

// Вынесли тяжелую функцию рендеринга из touchmove
function renderLoop() {
    if (!isDragging) return;
    tape.style.transform = `translate3d(${currentTranslate + dragOffset}px, 0, 0)`;
    animationFrameId = requestAnimationFrame(renderLoop); // Синхронизация с экраном смартфона
}

tape.addEventListener('touchstart', function(e) {
    if (isTransitioning) return;
    isDragging = true;
    touchStartX = e.touches[0].clientX;
    currentTranslate = -currentIndex * slideWidth;
    
    tape.style.transition = 'none';
    
    // Запускаем цикл отрисовки
    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(renderLoop);
}, { passive: true });

tape.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    // Только фиксируем цифры, ничего не перерисовываем здесь
    dragOffset = e.touches[0].clientX - touchStartX;
}, { passive: true });

tape.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationFrameId); // Останавливаем цикл
    
    const threshold = slideWidth * 0.15; // 15% достаточно для свайпа

    if (dragOffset < -threshold) {
        moveSlider(currentIndex + 1);
    } else if (dragOffset > threshold) {
        moveSlider(currentIndex - 1);
    } else {
        moveSlider(currentIndex);
    }
    dragOffset = 0;
}, { passive: true });

tape.addEventListener('touchcancel', function() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationFrameId);
    moveSlider(currentIndex);
    dragOffset = 0;
}, { passive: true });
