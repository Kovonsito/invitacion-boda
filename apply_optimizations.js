const fs = require('fs');

// 1. Actualizar assets/css/style.css
let css = fs.readFileSync('assets/css/style.css', 'utf8');
css = css.replace(
    'animation: fadeInGreeting 0.8s ease forwards;',
    'animation: fadeInGreeting 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;'
);
fs.writeFileSync('assets/css/style.css', css, 'utf8');

// 2. Actualizar assets/js/rsvp.js
let js = fs.readFileSync('assets/js/rsvp.js', 'utf8');

// Añadir soporte en initRSVP para mostrar inmediatamente datos en caché o precargados
const oldInit = `function initRSVP() {
    const urlParams = new URLSearchParams(window.location.search);
    guestId = urlParams.get('id');

    // 0. Detección preliminar inmediata de Padrinos para visualización sin retardo
    if (esInvitadoPadrino(guestId, null, null)) {
        activarModoPadrinos(data);
    }`;

const newInit = `function initRSVP() {
    const urlParams = new URLSearchParams(window.location.search);
    guestId = urlParams.get('id');

    // Saludo instantáneo si viene por parámetro (?n=Nombre o ?nombre=Nombre) o cache
    const preloadedName = window.__PRELOADED_GUEST_NAME__ || urlParams.get('n') || urlParams.get('nombre') || urlParams.get('guest');
    const splashGreeting = document.getElementById('splash-guest-greeting');
    if (splashGreeting && preloadedName) {
        splashGreeting.innerText = \`¡HOLA, \${preloadedName.trim().toUpperCase()}!\`;
        splashGreeting.style.display = 'block';
    }

    // Si existen datos del invitado en caché, precargarlos de inmediato sin esperar el fetch
    if (window.__CACHED_GUEST_DATA__) {
        currentGuestData = window.__CACHED_GUEST_DATA__;
        if (esInvitadoPadrino(currentGuestData.id, currentGuestData.contacto, currentGuestData.listaNombres, currentGuestData)) {
            activarModoPadrinos(currentGuestData);
        }
        procesarEstadoInvitado(currentGuestData);
    } else if (guestId) {
        try {
            const cachedStr = localStorage.getItem('guest_data_' + guestId);
            if (cachedStr) {
                const cachedData = JSON.parse(cachedStr);
                if (cachedData && cachedData.contacto) {
                    currentGuestData = cachedData;
                    if (splashGreeting) {
                        splashGreeting.innerText = \`¡HOLA, \${cachedData.contacto.trim().toUpperCase()}!\`;
                        splashGreeting.style.display = 'block';
                    }
                    if (esInvitadoPadrino(cachedData.id, cachedData.contacto, cachedData.listaNombres, cachedData)) {
                        activarModoPadrinos(cachedData);
                    }
                    procesarEstadoInvitado(cachedData);
                }
            }
        } catch(e) {}
    }

    // 0. Detección preliminar inmediata de Padrinos para visualización sin retardo
    if (esInvitadoPadrino(guestId, null, null)) {
        activarModoPadrinos(currentGuestData || null);
    }`;

if (js.includes(oldInit)) {
    js = js.replace(oldInit, newInit);
} else {
    console.error("No se encontró oldInit en rsvp.js");
}

// Guardar en localStorage cuando llegue la respuesta del fetch
const oldFetchSuccess = `            currentGuestData = data;

            // Saludo personalizado con el nombre en la portada de bienvenida
            const splashGreeting = document.getElementById('splash-guest-greeting');
            if (splashGreeting && data.contacto) {
                splashGreeting.innerText = \`¡HOLA, \${data.contacto.trim().toUpperCase()}!\`;
                splashGreeting.style.display = 'block';
            }`;

const newFetchSuccess = `            currentGuestData = data;
            if (guestId && data && !data.error) {
                try {
                    localStorage.setItem('guest_data_' + guestId, JSON.stringify(data));
                } catch(e) {}
            }

            // Saludo personalizado con el nombre en la portada de bienvenida
            const splashGreeting = document.getElementById('splash-guest-greeting');
            if (splashGreeting && data.contacto) {
                splashGreeting.innerText = \`¡HOLA, \${data.contacto.trim().toUpperCase()}!\`;
                splashGreeting.style.display = 'block';
            }`;

if (js.includes(oldFetchSuccess)) {
    js = js.replace(oldFetchSuccess, newFetchSuccess);
} else {
    console.error("No se encontró oldFetchSuccess en rsvp.js");
}

fs.writeFileSync('assets/js/rsvp.js', js, 'utf8');
console.log('UPDATE DONE');
