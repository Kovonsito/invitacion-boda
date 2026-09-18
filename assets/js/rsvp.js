// =========================================================
// MÓDULO DE ASISTENCIA DINÁMICA (RSVP) CON GOOGLE SHEETS
// =========================================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRzIDX3n2NREAz5-vHVM-_8Bx9VP_2h_7btv2sa0eHj-QvpvpXC95UGjtsWjoUo1-Czw/exec';

// Identificadores fijos de ID y nombres oficiales para distinguir a los Padrinos:
// - Isaac Huerta: id=11
// - Norma Cortés: id=13
// - Lupita Mercado: id=26
const PADRINO_IDS = ['11', '13', '26'];
const PADRINO_NAMES = ['lupita mercado', 'norma cortes', 'isaac huerta'];

let guestId = null;
let currentGuestData = null;

document.addEventListener('DOMContentLoaded', () => {
    initRSVP();
});

// Normaliza texto eliminando acentos y convirtiendo a minúsculas
function normalizarTexto(texto) {
    return (texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Determina si el usuario actual es uno de los padrinos asignados
function esInvitadoPadrino(id, contacto, listaNombres) {
    const urlParams = new URLSearchParams(window.location.search);
    const paramPadrino = urlParams.get('padrino') || urlParams.get('padrinos');
    if (paramPadrino === 'true' || paramPadrino === '1' || paramPadrino === 'si') {
        return true;
    }

    if (id && PADRINO_IDS.includes(String(id).trim())) {
        return true;
    }

    if (contacto) {
        const cContacto = normalizarTexto(contacto);
        if (PADRINO_NAMES.some(p => cContacto.includes(p))) {
            return true;
        }
    }

    if (Array.isArray(listaNombres)) {
        for (const item of listaNombres) {
            const cItem = normalizarTexto(item);
            if (PADRINO_NAMES.some(p => cItem.includes(p))) {
                return true;
            }
        }
    }

    return false;
}

// Activa la visualización de la sección exclusiva para padrinos
function activarModoPadrinos() {
    const padrinosCard = document.getElementById('padrinos-dresscode-card');
    const padrinosToggle = document.getElementById('padrinos-toggle-wrap');
    const generalPalette = document.getElementById('general-guest-palette');
    const badgePadrino = document.getElementById('padrino-badge-rsvp');

    if (padrinosCard) {
        padrinosCard.style.display = 'block';
    }
    if (padrinosToggle) {
        padrinosToggle.style.display = 'block';
    }
    if (generalPalette) {
        // Para padrinos se colapsa la paleta general por defecto para enfocar su paleta asignada
        generalPalette.style.display = 'none';
    }
    if (badgePadrino) {
        badgePadrino.style.display = 'inline-block';
    }

    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Alterna la visibilidad de la paleta general desde la vista de padrino
function toggleGeneralPalette() {
    const generalPalette = document.getElementById('general-guest-palette');
    const toggleText = document.getElementById('padrinos-toggle-text');
    if (!generalPalette) return;

    if (generalPalette.style.display === 'none' || generalPalette.style.display === '') {
        generalPalette.style.display = 'block';
        if (toggleText) toggleText.innerText = 'Ocultar paleta de invitados generales ▴';
        if (typeof AOS !== 'undefined') AOS.refresh();
    } else {
        generalPalette.style.display = 'none';
        if (toggleText) toggleText.innerText = 'Ver paleta de invitados generales ▾';
    }
}
window.toggleGeneralPalette = toggleGeneralPalette;

function initRSVP() {
    const urlParams = new URLSearchParams(window.location.search);
    guestId = urlParams.get('id');

    // 0. Detección preliminar inmediata de Padrinos para visualización sin retardo
    if (esInvitadoPadrino(guestId, null, null)) {
        activarModoPadrinos();
    }

    const loadingEl = document.getElementById('loading-state');
    const noIdEl = document.getElementById('no-id-state');
    const formEl = document.getElementById('form-state');
    const confirmedEl = document.getElementById('confirmed-state');

    // 1. Validar si el enlace incluye un ID
    if (!guestId) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (noIdEl) noIdEl.style.display = 'block';
        if (formEl) formEl.style.display = 'none';
        if (confirmedEl) confirmedEl.style.display = 'none';
        return;
    }

    // 2. Consultar datos del invitado a Google Sheets
    if (loadingEl) loadingEl.style.display = 'flex';
    if (noIdEl) noIdEl.style.display = 'none';
    fetch(`${SCRIPT_URL}?id=${encodeURIComponent(guestId)}`)
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

            // Confirmar condición de padrino con los datos recibidos de la hoja
            if (esInvitadoPadrino(data.id, data.contacto, data.listaNombres)) {
                activarModoPadrinos();
            }

            procesarEstadoInvitado(data);
        })
        .catch(err => {
            console.error('Error al cargar datos del invitado:', err);
            mostrarError('No pudimos cargar tus pases en este momento. Por favor intenta nuevamente.');
        });
}

// Procesa si el invitado ya confirmó previamente o si debe mostrar el formulario
function procesarEstadoInvitado(data) {
    const loadingEl = document.getElementById('loading-state');
    const confirmedEl = document.getElementById('confirmed-state');
    const confirmedMsg = document.getElementById('confirmed-msg');
    const confirmedTitle = document.getElementById('confirmed-title');

    if (loadingEl) loadingEl.style.display = 'none';

    const esConfirmado = data.estado === 'Confirmado' || (typeof data.confirmados === 'number' && data.confirmados > 0);
    const esNoAsiste = data.estado === 'Rechazado' || data.estado === 'No asistirá' || (data.confirmados === 0 && (data.estado === 'Rechazado' || data.estado === 'No asistirá'));

    if (esConfirmado) {
        if (confirmedEl) confirmedEl.style.display = 'block';
        if (confirmedTitle) confirmedTitle.innerText = '¡Asistencia Confirmada!';
        const total = data.confirmados || (data.listaNombres ? data.listaNombres.length : 1);
        if (confirmedMsg) {
            confirmedMsg.innerHTML = `¡Hola, <strong>${data.contacto.trim()}</strong>!<br>Ya registraste tu asistencia para <strong>${total} ${total === 1 ? 'persona' : 'personas'}</strong>.<br>¡Nos dará muchísimo gusto verte!`;
        }
    } else if (esNoAsiste) {
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
