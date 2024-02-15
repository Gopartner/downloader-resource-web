const express = require("express");
const path = require("path");
const fs = require("fs");
const request = require("request");
const archiver = require("archiver");
const morgan = require("morgan");

const app = express();

// Middleware untuk logger
app.use(morgan("dev"));

// Middleware untuk mengirim file statis
app.use(express.static(path.join(__dirname, "public")));

// Route untuk membuat folder
app.get("/createFolder", (req, res) => {
    const folderPath = req.query.folderPath;
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        res.send("Folder created");
    } else {
        res.send("Folder already exists");
    }
});

// Route untuk mengunduh dan menyimpan resource dari website
app.get("/downloadResources", (req, res) => {
    const baseUrl = req.query.baseUrl;
    const folderPath = req.query.folderPath;

    request(baseUrl, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const resourceUrls = body.match(/(?:href|src)="([^"]+)"/g).map(match => match.split('"')[1]);

            resourceUrls.forEach(resourceUrl => {
                request(resourceUrl).pipe(fs.createWriteStream(path.join(folderPath, path.basename(resourceUrl))));
            });

            res.send("Resources downloaded");
        } else {
            res.send("Error downloading resources");
        }
    });
});

// Route untuk mengompresi folder menjadi file zip
app.get("/compressFolder", (req, res) => {
    const folderPath = req.query.folderPath;
    const zipFilePath = `${folderPath}.zip`;

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", {
        zlib: { level: 9 } // Kompresi dengan tingkat tertinggi
    });

    output.on("close", () => {
        res.download(zipFilePath); // Unduh file zip setelah selesai dikompresi
    });

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
});

// Server berjalan di port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

