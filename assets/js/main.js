// Inicialización de animaciones AOS
AOS.init({
    once: true, // La animación se ejecuta al llegar al viewport
    duration: 800,
    offset: 120
});

const photoWrapper = document.querySelector('.env-photo-wrapper');
if (photoWrapper) {
    photoWrapper.addEventListener('click', () => {
        photoWrapper.classList.toggle('opened');
    });
}
