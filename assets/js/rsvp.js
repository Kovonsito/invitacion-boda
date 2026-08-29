// Lógica de confirmación y carga de pases para Google Apps Script
window.onload = function () {
    if (typeof rowId === 'undefined' || !rowId || rowId.includes('<?=') || rowId.includes('YOUR_ROW_ID')) {
        // Modo demostración o enlace directo sin ID
        console.warn("No se detectó rowId de Google Apps Script. Modo previsualización activo.");
        return;
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(cargarDatos).obtenerDatosInvitado(rowId);
    } else {
        document.getElementById('loading-state').innerText = "Por favor abre el enlace que te enviamos por WhatsApp.";
    }
};

function cargarDatos(data) {
    if (data.error) {
        document.getElementById('loading-state').innerText = data.error;
        return;
    }

    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('form-state').style.display = 'block';
    document.getElementById('guest-name').innerText = `¡Hola, ${data.contacto}!`;
    document.getElementById('badge-pases').innerText = `Pases asignados: ${data.maxPases}`;

    const listContainer = document.getElementById('guests-list');
    listContainer.innerHTML = '';

    data.listaNombres.forEach(nombre => {
        const item = document.createElement('label');
        item.className = 'guest-option';
        item.innerHTML = `
            <span>${nombre}</span>
            <input type="checkbox" name="invitado" value="${nombre}" checked>
        `;
        listContainer.appendChild(item);
    });
}

function enviarRSVP() {
    const seleccionados = Array.from(document.querySelectorAll('input[name="invitado"]:checked')).map(cb => cb.value);
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "Guardando...";

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function (res) {
            document.getElementById('form-state').style.display = 'none';
            document.getElementById('confirmed-state').style.display = 'block';
            document.getElementById('confirmed-msg').innerText = res.total > 0
                ? `Muchas gracias. Confirmaste ${res.total} persona(s). ¡Te esperamos!`
                : `Entendido. Lamentamos que no puedas asistir. ¡Gracias por avisarnos!`;
        }).registrarConfirmacion({ row: rowId, confirmados: seleccionados });
    } else {
        setTimeout(() => {
            document.getElementById('form-state').style.display = 'none';
            document.getElementById('confirmed-state').style.display = 'block';
            document.getElementById('confirmed-msg').innerText = seleccionados.length > 0
                ? `Muchas gracias. Confirmaste ${seleccionados.length} persona(s). ¡Te esperamos!`
                : `Entendido. Lamentamos que no puedas asistir. ¡Gracias por avisarnos!`;
        }, 600);
    }
}
