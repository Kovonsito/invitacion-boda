// =========================================================
// MÓDULO DE ASISTENCIA DINÁMICA (RSVP) CON GOOGLE SHEETS
// =========================================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwLF2vbVxl-pFc31h5tcISSU58n-DR6xXI3OoEI7vyXvGtM8lL_lDNci1vFsx2N3g0mrQ/exec';

let guestId = null;
let currentGuestData = null;

document.addEventListener('DOMContentLoaded', () => {
    initRSVP();
});

function initRSVP() {
    const urlParams = new URLSearchParams(window.location.search);
    guestId = urlParams.get('id');

    const loadingEl = document.getElementById('loading-state');
    const noIdEl = document.getElementById('no-id-state');
    const formEl = document.getElementById('form-state');
    const confirmedEl = document.getElementById('confirmed-state');

    // 1. Validar si el enlace incluye un ID
    if (!guestId) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (noIdEl) noIdEl.style.display = 'block';
        return;
    }

    // 2. Consultar datos del invitado a Google Sheets (Solo lectura, no registra visita de bots)
    fetch(`${SCRIPT_URL}?id=${encodeURIComponent(guestId)}&action=get_data`)
        .then(response => {
            if (!response.ok) throw new Error('Error en la conexión con el servidor');
            return response.json();
        })
        .then(data => {
            if (data.error) {
                mostrarError(data.error);
                return;
            }
            currentGuestData = data;
            procesarEstadoInvitado(data);
        })
        .catch(err => {
            console.error('Error al cargar datos del invitado:', err);
            mostrarError('No pudimos cargar tus pases en este momento. Por favor intenta nuevamente.');
        });
}

// Registra la apertura de forma 100% segura únicamente cuando el usuario abre el sobre
let haRegistradoApertura = false;
function registrarAperturaInvitado() {
    if (!guestId || haRegistradoApertura) return;
    haRegistradoApertura = true;

    // Enviar señal de apertura real (acción humana)
    fetch(`${SCRIPT_URL}?id=${encodeURIComponent(guestId)}&action=track_open`, {
        method: 'GET',
        mode: 'no-cors' // Envío rápido y silencioso en segundo plano
    }).catch(err => {
        console.warn('Registro de apertura en segundo plano:', err);
    });
}

// Procesa si el invitado ya confirmó previamente o si debe mostrar el formulario
function procesarEstadoInvitado(data) {
    const loadingEl = document.getElementById('loading-state');
    const confirmedEl = document.getElementById('confirmed-state');
    const confirmedMsg = document.getElementById('confirmed-msg');
    const confirmedTitle = document.getElementById('confirmed-title');

    if (loadingEl) loadingEl.style.display = 'none';

    if (data.estado === 'Confirmado') {
        if (confirmedEl) confirmedEl.style.display = 'block';
        if (confirmedTitle) confirmedTitle.innerText = '¡Asistencia Confirmada!';
        const total = data.confirmados || (data.listaNombres ? data.listaNombres.length : 1);
        if (confirmedMsg) {
            confirmedMsg.innerHTML = `¡Hola, <strong>${data.contacto.trim()}</strong>!<br>Ya registraste tu asistencia para <strong>${total} ${total === 1 ? 'persona' : 'personas'}</strong>.<br>¡Nos dará muchísimo gusto verte!`;
        }
    } else if (data.estado === 'No asistirá') {
        if (confirmedEl) confirmedEl.style.display = 'block';
        if (confirmedTitle) confirmedTitle.innerText = 'Respuesta Registrada';
        if (confirmedMsg) {
            confirmedMsg.innerHTML = `¡Hola, <strong>${data.contacto.trim()}</strong>!<br>Registraste que no podrás acompañarnos. Lamentamos que no puedas asistir, ¡muchas gracias por avisarnos!`;
        }
    } else {
        // Aún no ha respondido: mostrar formulario
        mostrarFormulario(data);
    }
}

// Construye la lista interactiva de pases y nombres
function mostrarFormulario(data) {
    const formEl = document.getElementById('form-state');
    const confirmedEl = document.getElementById('confirmed-state');
    const guestNameEl = document.getElementById('guest-name');
    const badgePasesEl = document.getElementById('badge-pases');
    const listContainer = document.getElementById('guests-list');

    if (confirmedEl) confirmedEl.style.display = 'none';
    if (formEl) formEl.style.display = 'block';

    if (guestNameEl) guestNameEl.innerText = `¡Hola, ${data.contacto.trim()}!`;
    if (badgePasesEl) {
        const plural = data.maxPases === 1 ? 'pase asignado' : 'pases asignados';
        badgePasesEl.innerText = `${data.maxPases} ${plural}`;
    }

    if (!listContainer) return;
    listContainer.innerHTML = '';

    const nombres = (data.listaNombres && data.listaNombres.length > 0)
        ? data.listaNombres
        : [data.contacto.trim()];

    nombres.forEach((nombre, index) => {
        const item = document.createElement('label');
        item.className = 'guest-option selected';
        item.innerHTML = `
            <span class="guest-label-text">${nombre}</span>
            <input type="checkbox" name="invitado" value="${nombre}" checked onchange="actualizarSeleccion(this)">
        `;
        listContainer.appendChild(item);
    });
}

function actualizarSeleccion(checkbox) {
    const parent = checkbox.closest('.guest-option');
    if (parent) {
        if (checkbox.checked) {
            parent.classList.add('selected');
        } else {
            parent.classList.remove('selected');
        }
    }
}

// Envía la confirmación hacia Google Sheets
function enviarRSVP(tipo) {
    const btnSubmit = document.getElementById('btn-submit');
    const btnDecline = document.getElementById('btn-decline');

    let seleccionados = [];

    if (tipo === 'Confirmado') {
        const checkboxes = document.querySelectorAll('input[name="invitado"]:checked');
        seleccionados = Array.from(checkboxes).map(cb => cb.value);

        if (seleccionados.length === 0) {
            alert('Por favor selecciona al menos a una persona para confirmar, o presiona "No podré asistir".');
            return;
        }
    } else {
        const confirmar = confirm('¿Confirmas que no podrás acompañarnos en nuestra boda?');
        if (!confirmar) return;
    }

    // Deshabilitar botones durante el envío
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Guardando...';
    }
    if (btnDecline) btnDecline.disabled = true;

    const payload = {
        id: guestId,
        confirmados: seleccionados,
        estado: tipo
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) throw new Error(data.error);

        // Actualizar datos locales
        if (currentGuestData) {
            currentGuestData.estado = tipo;
            currentGuestData.confirmados = seleccionados.length;
        }

        const formEl = document.getElementById('form-state');
        const confirmedEl = document.getElementById('confirmed-state');
        const confirmedTitle = document.getElementById('confirmed-title');
        const confirmedMsg = document.getElementById('confirmed-msg');

        if (formEl) formEl.style.display = 'none';
        if (confirmedEl) confirmedEl.style.display = 'block';

        if (tipo === 'Confirmado') {
            if (confirmedTitle) confirmedTitle.innerText = '¡Asistencia Confirmada!';
            if (confirmedMsg) {
                confirmedMsg.innerHTML = `Muchas gracias por confirmar.<br>Asistencia registrada para <strong>${seleccionados.length} ${seleccionados.length === 1 ? 'persona' : 'personas'}</strong>.<br>¡Te esperamos con mucha emoción!`;
            }
        } else {
            if (confirmedTitle) confirmedTitle.innerText = 'Muchas Gracias';
            if (confirmedMsg) {
                confirmedMsg.innerHTML = `Lamentamos que no puedas acompañarnos.<br>¡Agradecemos mucho que nos hayas avisado!`;
            }
        }
    })
    .catch(err => {
        console.error('Error al guardar confirmación:', err);
        alert('Hubo un inconveniente al guardar tu respuesta. Por favor intenta de nuevo en unos segundos.');
    })
    .finally(() => {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Confirmar Asistencia';
        }
        if (btnDecline) btnDecline.disabled = false;
    });
}

// Permite reabrir el formulario para corregir o cambiar la confirmación
function editarRSVP() {
    if (currentGuestData) {
        mostrarFormulario(currentGuestData);
    }
}

function mostrarError(mensaje) {
    const loadingEl = document.getElementById('loading-state');
    if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.innerHTML = `<span style="color: #9d3838;">${mensaje}</span>`;
    }
}
