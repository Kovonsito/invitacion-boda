// Control de Audio / Música de Fondo
let isPlaying = false;
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');

function toggleMusic(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!bgMusic) return;

    const playerPlayBtn = document.getElementById('player-play-btn');

    if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
        if (musicIcon) musicIcon.innerHTML = '&#9654;'; // Icono Play
        if (playerPlayBtn) playerPlayBtn.innerHTML = '&#9654;';
    } else {
        bgMusic.play().then(() => {
            isPlaying = true;
            if (musicToggleBtn) musicToggleBtn.classList.add('playing');
            if (musicIcon) musicIcon.innerHTML = '&#10074;&#10074;'; // Icono Pausa
            if (playerPlayBtn) playerPlayBtn.innerHTML = '&#10074;&#10074;';
        }).catch(err => {
            console.log("Reproducción automática bloqueada por el navegador:", err);
        });
    }
}

// Retroceder 10 segundos
function rewindMusic(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!bgMusic) return;
    bgMusic.currentTime = Math.max(0, bgMusic.currentTime - 10);
}

// Adelantar 10 segundos
function forwardMusic(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!bgMusic) return;
    bgMusic.currentTime = Math.min(bgMusic.duration || 0, bgMusic.currentTime + 10);
}

// Actualizar barra de progreso del reproductor en tiempo real
if (bgMusic) {
    bgMusic.addEventListener('timeupdate', () => {
        const fill = document.getElementById('player-progress-fill');
        const dot = document.getElementById('player-progress-dot');
        if (fill && dot && bgMusic.duration) {
            const percentage = (bgMusic.currentTime / bgMusic.duration) * 100;
            fill.style.width = percentage + '%';
            dot.style.left = percentage + '%';
        }
    });
}

// Intentar reproducir en el primer clic o interacción del usuario
document.addEventListener('click', function autoPlayOnce() {
    if (!isPlaying && bgMusic && bgMusic.paused) {
        bgMusic.play().then(() => {
            isPlaying = true;
            if (musicToggleBtn) musicToggleBtn.classList.add('playing');
            if (musicIcon) musicIcon.innerHTML = '&#10074;&#10074;';
        }).catch(() => {});
    }
    document.removeEventListener('click', autoPlayOnce);
}, { once: true });
