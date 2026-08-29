// Countdown Timer
function initCountdown(targetDateStr) {
    const targetDate = new Date(targetDateStr).getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            document.getElementById('cd-days').innerText = '00';
            document.getElementById('cd-hours').innerText = '00';
            document.getElementById('cd-minutes').innerText = '00';
            document.getElementById('cd-seconds').innerText = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const formatNumber = num => String(num).padStart(2, '0');

        const elDays = document.getElementById('cd-days');
        const elHours = document.getElementById('cd-hours');
        const elMins = document.getElementById('cd-minutes');
        const elSecs = document.getElementById('cd-seconds');

        if (elDays) elDays.innerText = formatNumber(days);
        if (elHours) elHours.innerText = formatNumber(hours);
        if (elMins) elMins.innerText = formatNumber(minutes);
        if (elSecs) elSecs.innerText = formatNumber(seconds);
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Inicializar cuenta regresiva para el 4 de Diciembre de 2026 a las 14:00 hrs
document.addEventListener('DOMContentLoaded', () => {
    initCountdown('2026-12-04T14:00:00');
});
