document.getElementById('phoneBtn').addEventListener('click', function () {
    const phoneNumber = this.getAttribute('data-phone');
    navigator.clipboard.writeText(phoneNumber).then(() => {
        const toast = document.getElementById('copyToast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Не удалось скопировать: ', err);
    });
});

// Находим ленту со слайдами
const tape = document.getElementById('sliderTape');
// Считаем общее количество карточек в слайдере
const slides = document.querySelectorAll('.second-section');
const totalSlides = slides.length;

let currentIndex = 0; // Номер текущего слайда
let isTransitioning = false; // Флаг для блокировки быстрых кликов

// Функция получения актуальной ширины слайда
function getSlideWidth() {
    return slides[0].offsetWidth;
}

// Функция, которая двигает ленту на нужный слайд
function moveSlider(index, instant = false) {
    if (isTransitioning && !instant) return;
    
    const slideWidth = getSlideWidth();
    const offset = -index * slideWidth;
    
    if (instant) {
        // Мгновенный переход без анимации
        tape.style.transition = 'none';
        tape.style.transform = `translateX(${offset}px)`;
        // Возвращаем анимацию после применения позиции
        setTimeout(() => {
            tape.style.transition = 'transform 0.5s ease-in-out';
        }, 50);
    } else {
        tape.style.transition = 'transform 0.5s ease-in-out';
        tape.style.transform = `translateX(${offset}px)`;
        isTransitioning = true;
        
        // Разблокируем после завершения анимации
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }
}

// Находим все кнопки "Вперед" и вешаем на них клик
document.querySelectorAll('.slider-next').forEach(button => {
    button.addEventListener('click', () => {
        if (isTransitioning) return; // Блокируем быстрые клики
        
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Возврат в начало
        }
        moveSlider(currentIndex);
    });
});

// Находим все кнопки "Назад" и вешаем на них клик
document.querySelectorAll('.slider-prev').forEach(button => {
    button.addEventListener('click', () => {
        if (isTransitioning) return; // Блокируем быстрые клики
        
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalSlides - 1; // Возврат в конец
        }
        moveSlider(currentIndex);
    });
});

// Пересчитываем позицию слайдера при изменении размера окна
window.addEventListener('resize', () => {
    moveSlider(currentIndex, true); // Мгновенный переход при ресайзе
});

// Копирование номера телефона из блока контактов
document.getElementById('contactPhoneBtn').addEventListener('click', function() {
    const phoneNumber = this.getAttribute('data-phone');
    navigator.clipboard.writeText(phoneNumber).then(() => {
        const toast = document.getElementById('contactCopyToast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Не удалось скопировать номер: ', err);
    });
});

// ========================================
// СВАЙПЫ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
// ========================================

let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;
let dragOffset = 0;
const sliderWindow = document.querySelector('.slider-window');

// Начало касания
tape.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
    dragOffset = 0;
    tape.style.transition = 'none';
}, { passive: true });

// Движение пальца
tape.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    
    touchEndX = e.touches[0].clientX;
    dragOffset = touchEndX - touchStartX;
    
    const slideWidth = getSlideWidth();
    const currentOffset = -currentIndex * slideWidth + dragOffset;
    
    tape.style.transform = `translateX(${currentOffset}px)`;
}, { passive: true });

// Конец касания
tape.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    
    tape.style.transition = 'transform 0.5s ease-in-out';
    
    const slideWidth = getSlideWidth();
    const threshold = slideWidth * 0.2;
    
    if (dragOffset > threshold) {
        // Свайп вправо - предыдущий слайд
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalSlides - 1; // Циклический переход в конец
        }
    } else if (dragOffset < -threshold) {
        // Свайп влево - следующий слайд
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Циклический переход в начало
        }
    }
    
    moveSlider(currentIndex);
    dragOffset = 0;
}, { passive: true });

// Отмена свайпа
tape.addEventListener('touchcancel', function(e) {
    isDragging = false;
    tape.style.transition = 'transform 0.5s ease-in-out';
    moveSlider(currentIndex);
    dragOffset = 0;
}, { passive: true });