const tzSelect = document.getElementById('timezone-select');
const sizeSelect = document.getElementById('size-select');
const themeToggle = document.getElementById('theme-toggle');
const wakeToggle = document.getElementById('wake-toggle');
const clockMain = document.getElementById('clock-main');
const statusMsg = document.getElementById('wake-status');

// 1. Populate Timezones
const localOpt = document.createElement('option');
localOpt.value = 'local';
localOpt.textContent = 'Local Time (Auto)';
tzSelect.appendChild(localOpt);

Intl.supportedValuesOf('timeZone').forEach(tz => {
    const option = document.createElement('option');
    option.value = tz;
    option.textContent = tz.replace(/_/g, ' ');
    tzSelect.appendChild(option);
});

// 2. Size Switcher Fix
sizeSelect.addEventListener('change', () => {
    clockMain.classList.remove('size-large', 'size-medium', 'size-small');
    clockMain.classList.add(sizeSelect.value);
});

// 3. Theme Toggle
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', themeToggle.checked);
});

// 4. Stay Awake (Wake Lock)
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            statusMsg.textContent = "● Stay Awake Active";
        }
    } catch (err) {
        console.error(err);
        wakeToggle.checked = false;
    }
}

wakeToggle.addEventListener('change', async () => {
    if (wakeToggle.checked) await requestWakeLock();
    else {
        if (wakeLock) await wakeLock.release();
        wakeLock = null;
        statusMsg.textContent = "";
    }
});

// 5. High Precision Clock Loop
function updateClock() {
    const now = new Date();
    const tz = tzSelect.value;
    
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    if (tz !== 'local') timeOptions.timeZone = tz;

    try {
        const timeStr = new Intl.DateTimeFormat('en-GB', timeOptions).format(now);
        const ms = now.getMilliseconds().toString().padStart(3, '0');
        
        document.getElementById('time').textContent = timeStr;
        document.getElementById('ms').textContent = `:${ms}`;
        
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        if (tz !== 'local') dateOptions.timeZone = tz;
        document.getElementById('date-display').textContent = now.toLocaleDateString(undefined, dateOptions);
    } catch (e) {
        document.getElementById('time').textContent = "Error";
    }

    requestAnimationFrame(updateClock);
}

// 6. Fullscreen
document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
});

requestAnimationFrame(updateClock);