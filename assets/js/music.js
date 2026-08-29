// Control de Audio / Música de Fondo
let isPlaying = false;
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');

function toggleMusic() {
    if (!bgMusic) return;

    if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
        if (musicIcon) musicIcon.innerHTML = '&#9654;'; // Icono Play
    } else {
        bgMusic.play().then(() => {
            isPlaying = true;
            if (musicToggleBtn) musicToggleBtn.classList.add('playing');
            if (musicIcon) musicIcon.innerHTML = '&#10074;&#10074;'; // Icono Pausa
        }).catch(err => {
            console.log("Reproducción automática bloqueada por el navegador:", err);
        });
    }
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
