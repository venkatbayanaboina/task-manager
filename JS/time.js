/* ── JS/time.js ──
   Live clock — updates every second.
   Original only ran once; now it ticks continuously.
*/
function updateClock() {
    const el = document.getElementById('datetime');
    if (el) el.textContent = new Date().toLocaleString();
}
updateClock();
setInterval(updateClock, 1000);