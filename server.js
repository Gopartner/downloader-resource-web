// server.js

const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
const fs = require('fs');
const path = require('path');
const request = require('request');
const archiver = require('archiver');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/download', (req, res) => {
    const { url } = req.body;
    const zipFileName = 'web.zip';
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        res.download(zipFileName);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    request(url)
        .on('response', (response) => {
            console.log(`Downloading ${url}...`);
        })
        .on('error', (err) => {
            throw err;
        })
        .pipe(archive);
});

app.listen(PORT, () => {
    const ipAddresses = [];
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceKey in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceKey];
        for (let i = 0; i < interfaces.length; i++) {
            const iface = interfaces[i];
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddresses.push(iface.address);
            }
        }
    }
    console.log(`Server is running on the following IP addresses:`);
    ipAddresses.forEach(ip => console.log(`- http://${ip}:${PORT}`));
});

