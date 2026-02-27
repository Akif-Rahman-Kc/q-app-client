const https = require('https');
https.get('https://api.alquran.cloud/v1/meta', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const data = JSON.parse(body).data;
        console.log("Keys in meta:", Object.keys(data));
        if (data.juzs) console.log("Has juzs:", typeof data.juzs);
        else console.log("NO JUZS IN API META!");
    });
});
