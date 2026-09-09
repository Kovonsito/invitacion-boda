// Inicialización de animaciones AOS
AOS.init({
    once: true, // La animación se ejecuta al llegar al viewport
    duration: 900,
    easing: 'ease-out-cubic',
    offset: 70
});

const photoWrapper = document.querySelector('.env-photo-wrapper');
if (photoWrapper) {
    photoWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        photoWrapper.classList.toggle('opened');
    });

    document.addEventListener('click', (e) => {
        if (!photoWrapper.contains(e.target) && photoWrapper.classList.contains('opened')) {
            photoWrapper.classList.remove('opened');
        }
    });
}

// =========================================================
// MODAL DE MAPA & UBICACIÓN
// =========================================================
function openMapModal() {
    const modal = document.getElementById('map-modal');
    if (!modal) return;

    // Cargar iframe de manera diferida (lazy load) en la primera apertura
    const iframe = document.getElementById('map-iframe');
    if (iframe && (!iframe.src || iframe.src === 'about:blank' || iframe.src === window.location.href)) {
        const dataSrc = iframe.getAttribute('data-src');
        if (dataSrc) {
            iframe.src = dataSrc;
        }
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
}

function closeMapModal(event) {
    // Si viene de un evento de click y no es en el fondo o en el botón cerrar, ignorar
    if (event && event.target && 
        !event.target.classList.contains('map-modal-backdrop') && 
        !event.target.classList.contains('map-modal-close') && 
        !event.target.closest('.map-modal-close')) {
        return;
    }

    const modal = document.getElementById('map-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restaurar scroll
}

// =========================================================
// MODAL AGREGAR AL CALENDARIO
// =========================================================
function openCalendarModal() {
    const modal = document.getElementById('calendar-modal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
}

function closeCalendarModal(event) {
    if (event && event.target && 
        !event.target.classList.contains('map-modal-backdrop') && 
        !event.target.classList.contains('map-modal-close') && 
        !event.target.closest('.map-modal-close')) {
        return;
    }

    const modal = document.getElementById('calendar-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restaurar scroll
}

// Generador y descargador de archivo universal .ics con alertas
function downloadWeddingIcs() {
    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Kevin y Mayalli//Boda//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:boda-kevin-mayalli-20261204@invitacion",
        "DTSTAMP:20260908T160000Z",
        "DTSTART:20261204T140000",
        "DTEND:20261205T020000",
        "SUMMARY:💍 Boda de Kevin & Mayalli",
        "DESCRIPTION:¡Nos casamos! Acompáñanos a celebrar nuestro gran día.\\n\\nCeremonia: 2:00 PM\\nRecepción: 3:00 PM\\nLugar: Azul Terraza\\nUbicación: Palomas km 1.8, El Armadillo, 63792 Tepic, Nay.",
        "LOCATION:Azul Terraza, Palomas km 1.8, El Armadillo, 63792 Tepic, Nay.",
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-P1W",
        "ACTION:DISPLAY",
        "DESCRIPTION:Recordatorio: ¡Falta 1 semana para la Boda de Kevin & Mayalli!",
        "END:VALARM",
        "BEGIN:VALARM",
        "TRIGGER:-P1D",
        "ACTION:DISPLAY",
        "DESCRIPTION:Recordatorio: ¡Mañana es la Boda de Kevin & Mayalli!",
        "END:VALARM",
        "BEGIN:VALARM",
        "TRIGGER:-PT3H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Recordatorio: ¡Hoy es la Boda de Kevin & Mayalli a las 2:00 PM!",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Boda-Kevin-y-Mayalli.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Cerrar cualquier modal al presionar la tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const mapModal = document.getElementById('map-modal');
        if (mapModal && mapModal.classList.contains('active')) {
            closeMapModal();
        }
        const calModal = document.getElementById('calendar-modal');
        if (calModal && calModal.classList.contains('active')) {
            closeCalendarModal();
        }
    }
});
