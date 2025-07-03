// Установка фона
document.addEventListener('DOMContentLoaded', function() {
    const background = document.querySelector('.background');
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

    // Инициализация аудиоплеера
    initAudioPlayer();
    
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
});

// Функциональность аудиоплеера
let currentAudio = null;
let currentTrackIndex = 0;
let tracks = [];
let isPlaying = false;

function initAudioPlayer() {
    loadTracks();
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const seekBar = document.getElementById('seekBar');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlay);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPrevious);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', playNext);
    }
    
    if (seekBar) {
        seekBar.addEventListener('input', seek);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', setVolume);
    }
}

function loadTracks() {
    fetch('/api/tracks')
        .then(response => response.json())
        .then(data => {
            tracks = data;
            updatePlaylist();
            if (tracks.length > 0) {
                loadTrack(0);
            }
        })
        .catch(error => {
            console.error('Error loading tracks:', error);
        });
}

function updatePlaylist() {
    const playlist = document.getElementById('playlist');
    if (!playlist) return;
    
    playlist.innerHTML = '';
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        
        // Create track info container
        const trackInfo = document.createElement('div');
        trackInfo.className = 'track-info';
        
        // Create title element with safe text content
        const titleDiv = document.createElement('div');
        titleDiv.className = 'track-title';
        titleDiv.textContent = track.title;
        
        // Create artist element with safe text content
        const artistDiv = document.createElement('div');
        artistDiv.className = 'track-artist';
        artistDiv.textContent = track.artist;
        
        // Append elements
        trackInfo.appendChild(titleDiv);
        trackInfo.appendChild(artistDiv);
        item.appendChild(trackInfo);
        
        item.addEventListener('click', () => {
            loadTrack(index);
            if (isPlaying) {
                play();
            }
        });
        playlist.appendChild(item);
    });
}

function loadTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    
    currentTrackIndex = index;
    const track = tracks[index];
    
    if (currentAudio) {
        currentAudio.pause();
    }
    
    currentAudio = new Audio(track.file_url);
    currentAudio.addEventListener('loadedmetadata', updateDuration);
    currentAudio.addEventListener('timeupdate', updateProgress);
    currentAudio.addEventListener('ended', playNext);
    
    // Обновление информации о треке
    const trackTitle = document.querySelector('.track-title');
    const trackArtist = document.querySelector('.track-artist');
    
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    
    // Обновление активного элемента плейлиста
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

function togglePlay() {
    if (!currentAudio) return;
    
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    if (!currentAudio) return;
    
    currentAudio.play();
    isPlaying = true;
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function pause() {
    if (!currentAudio) return;
    
    currentAudio.pause();
    isPlaying = false;
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function playPrevious() {
    const prevIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    loadTrack(prevIndex);
    if (isPlaying) {
        play();
    }
}

function playNext() {
    const nextIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    loadTrack(nextIndex);
    if (isPlaying) {
        play();
    }
}

function seek() {
    if (!currentAudio) return;
    
    const seekBar = document.getElementById('seekBar');
    currentAudio.currentTime = seekBar.value;
}

function setVolume() {
    if (!currentAudio) return;
    
    const volumeSlider = document.getElementById('volumeSlider');
    currentAudio.volume = volumeSlider.value / 100;
}

function updateDuration() {
    if (!currentAudio) return;
    
    const seekBar = document.getElementById('seekBar');
    const durationSpan = document.getElementById('duration');
    
    if (seekBar) {
        seekBar.max = currentAudio.duration;
    }
    
    if (durationSpan) {
        durationSpan.textContent = formatTime(currentAudio.duration);
    }
}

function updateProgress() {
    if (!currentAudio) return;
    
    const seekBar = document.getElementById('seekBar');
    const currentTimeSpan = document.getElementById('currentTime');
    
    if (seekBar) {
        seekBar.value = currentAudio.currentTime;
    }
    
    if (currentTimeSpan) {
        currentTimeSpan.textContent = formatTime(currentAudio.currentTime);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    preloadImages();
});
