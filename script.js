// --- Konfigurasi Awal ---
// Data Dummy Waktu Sholat (HARUS DIGANTI dengan data API Realtime berdasarkan lokasi)
const PRAYER_TIMES_TODAY = {
    'Subuh': '04:11',
    'Dzuhur': '11:40',
    'Ashar': '14:52',
    'Maghrib': '17:54',
    'Isya': '19:00'
};

const prayerNames = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

/**
 * Fungsi pembantu untuk format waktu.
 * @param {number} num Angka jam/menit/detik.
 */
const formatTimeComponent = (num) => String(num).padStart(2, '0');

/**
 * Fungsi untuk mendapatkan Tanggal Hijriyah (Perlu API/Library Kompleks)
 * CATATAN: Fungsi ini hanya placeholder. Untuk tanggal akurat, gunakan API.
 */
function getHijriDate() {
    // Implementasi real memerlukan perhitungan atau API eksternal (misalnya: http://api.aladhan.com/v1/gToH)
    return '29 Rabiul Awal 1447 H'; 
}

/**
 * Fungsi Utama untuk memperbarui seluruh tampilan jam.
 */
function updateMasjidClock() {
    const now = new Date();
    
    // 1. Update Jam Digital
    const hours = formatTimeComponent(now.getHours());
    const minutes = formatTimeComponent(now.getMinutes());
    const seconds = formatTimeComponent(now.getSeconds());
    document.getElementById('digital-clock').textContent = `${hours}:${minutes}:${seconds}`;

    // 2. Update Tanggal Masehi & Hijriyah
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateMasehi = now.toLocaleDateString('id-ID', options);
    document.getElementById('date-masehi').textContent = dateMasehi;
    document.getElementById('date-hijri').textContent = getHijriDate();
    
    // 3. Logika Waktu Sholat dan Highlight
    let nextPrayerName = '';
    let minTimeDiffSeconds = Infinity;
    const currentTimeSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // Reset dan Update Waktu Sholat di Grid
    document.querySelectorAll('.prayer-item').forEach(item => {
        item.classList.remove('active-prayer');
    });
    
    let isPrayerActive = false;

    // Loop untuk menemukan waktu sholat yang sedang berlangsung dan berikutnya
    for (const name of prayerNames) {
        const time = PRAYER_TIMES_TODAY[name];
        const [prayerHour, prayerMinute] = time.split(':').map(Number);
        const prayerTimeSeconds = prayerHour * 3600 + prayerMinute * 60;
        
        const prayerItemElement = document.getElementById(`${name.toLowerCase()}-item`);
        document.getElementById(`${name.toLowerCase()}-time`).textContent = time;

        let timeDiff = prayerTimeSeconds - currentTimeSeconds;

        // Logika Highlight (Anggap waktu sholat berlangsung selama 15 menit)
        if (currentTimeSeconds >= prayerTimeSeconds && currentTimeSeconds < prayerTimeSeconds + (15 * 60)) { 
            prayerItemElement.classList.add('active-prayer');
            isPrayerActive = true;
        }

        // Logika Waktu Sholat Berikutnya (paling dekat di masa depan)
        if (timeDiff > 0 && timeDiff < minTimeDiffSeconds) {
            minTimeDiffSeconds = timeDiff;
            nextPrayerName = name;
        }
    }
    
    // 4. Hitung Mundur Waktu Sholat Berikutnya
    if (!isPrayerActive) {
        // Jika sholat hari ini sudah lewat semua (setelah Isya), hitung mundur ke Subuh besok
        if (nextPrayerName === '') {
            nextPrayerName = 'Subuh (Besok)';
            // Subuh besok = 24 jam + Waktu Subuh (04:30)
            const subuhTimeTomorrowSeconds = (24 * 3600) + (4 * 3600 + 30 * 60); 
            minTimeDiffSeconds = subuhTimeTomorrowSeconds - currentTimeSeconds;
        }

        const remHours = Math.floor(minTimeDiffSeconds / 3600);
        const remMinutes = Math.floor((minTimeDiffSeconds % 3600) / 60);
        const remSeconds = minTimeDiffSeconds % 60;

        const countdown = `${formatTimeComponent(remHours)}:${formatTimeComponent(remMinutes)}:${formatTimeComponent(remSeconds)}`;

        document.getElementById('next-prayer-info').innerHTML = 
            `Waktu Sholat Berikutnya: <span class="highlight">${nextPrayerName}</span> dalam ${countdown}`;
    } else {
        document.getElementById('next-prayer-info').innerHTML = 
            `Sedang Berlangsung: <span class="highlight">Iqamah</span>. Mohon Segera Merapat.`;
    }
}

// Panggil fungsi sekali untuk inisialisasi, kemudian set interval untuk update setiap detik
updateMasjidClock();
setInterval(updateMasjidClock, 1000); 

// Catatan: Anda dapat menambahkan API fetch di sini untuk mengambil data sholat real-time
/*
function fetchPrayerTimes() {
    // Contoh API: http://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=11
    fetch('URL_API_ANDA_DI_SINI')
        .then(response => response.json())
        .then(data => {
            // Update PRAYER_TIMES_TODAY dengan data dari API
            // ...
        })
        .catch(error => console.error('Gagal mengambil waktu sholat:', error));
}
fetchPrayerTimes();
*/