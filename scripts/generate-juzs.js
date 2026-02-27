const fs = require('fs');
const path = require('path');

const generateJuzs = () => {
    const quranPath = path.join(__dirname, '..', 'assets', 'data', 'quran-uthmani.json');
    if (!fs.existsSync(quranPath)) return console.error('Quran uthmani data not found!');

    const quran = JSON.parse(fs.readFileSync(quranPath, 'utf8'));
    const juzMap = {};

    quran.surahs.forEach(surah => {
        surah.ayahs.forEach(ayah => {
            const juzNum = ayah.juz;
            if (!juzMap[juzNum]) {
                juzMap[juzNum] = {
                    juz: juzNum,
                    start: { surah: surah.number, ayah: ayah.numberInSurah },
                    end: { surah: surah.number, ayah: ayah.numberInSurah }
                };
            } else {
                juzMap[juzNum].end = { surah: surah.number, ayah: ayah.numberInSurah };
            }
        });
    });

    const juzsArray = Object.values(juzMap).sort((a, b) => a.juz - b.juz);
    fs.writeFileSync(path.join(__dirname, '..', 'assets', 'data', 'juzs.json'), JSON.stringify(juzsArray, null, 2));
    console.log('✅ Generated juzs.json containing precisely 30 Juzs mapped to Surahs/Ayahs');
};

generateJuzs();
