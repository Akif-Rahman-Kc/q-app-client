const fs = require('fs');
const https = require('https');
const path = require('path');

const fetchJson = (url) => new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    }).on('error', reject);
});

async function run() {
    const dir = path.join(__dirname, '..', 'assets', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    try {
        console.log('Fetching Surahs...');
        const surahs = await fetchJson('https://api.alquran.cloud/v1/surah');
        fs.writeFileSync(path.join(dir, 'surahs.json'), JSON.stringify(surahs.data, null, 2));

        console.log('Fetching Meta (Juzs)...');
        const meta = await fetchJson('https://api.alquran.cloud/v1/meta');
        fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta.data, null, 2));

        console.log('Fetching Complete Arabic Text...');
        const arabic = await fetchJson('https://api.alquran.cloud/v1/quran/quran-uthmani');
        fs.writeFileSync(path.join(dir, 'quran-uthmani.json'), JSON.stringify(arabic.data, null, 0));

        console.log('Fetching Complete English Translation...');
        const english = await fetchJson('https://api.alquran.cloud/v1/quran/en.asad');
        fs.writeFileSync(path.join(dir, 'quran-en.json'), JSON.stringify(english.data, null, 0));

        console.log('✅ Successfully downloaded and bundled standard static Quran data directly into the app assets!');
    } catch (e) {
        console.error('Error fetching data:', e);
    }
}

run();
