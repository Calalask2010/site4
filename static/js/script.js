// Установка фона
document.addEventListener('DOMContentLoaded', function() {
    const background = document.querySelector('.background');
    if (background) {
        const bgType = getComputedStyle(document.documentElement).getPropertyValue('--background-type').trim().replace(/['"]/g, '');
        
        if (bgType === 'image') {
            background.classList.add('image');
        } else if (bgType === 'gradient') {
            background.classList.add('gradient');
        } else if (bgType === 'video') {
            const video = document.createElement('video');
            video.src = getComputedStyle(document.documentElement).getPropertyValue('--background-video').trim().replace(/['"]/g, '');
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            background.appendChild(video);
        }
    }
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Инициализация предварительной загрузки изображений
    preloadImages();
});

// Анимации при скролле
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
});

document.querySelectorAll('.card, .portfolio-item, .blog-post').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Обработка форм
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.classList.contains('ajax-form')) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Отправка...';
        
        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                form.reset();
            } else {
                showNotification(data.message, 'danger');
            }
        })
        .catch(error => {
            showNotification('Произошла ошибка при отправке формы', 'danger');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }
});

// Предварительная загрузка изображений
function preloadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });
}