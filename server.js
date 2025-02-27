const fs = require('fs');
const http = require('http');
const path = require('path');
const { promisify } = require('util');

// Promisify fs.readFile for async/await support
const readFile = promisify(fs.readFile);

const server = http.createServer(async (req, res) => {
    let filePath = '.' + req.url;

    if (filePath === './' || filePath === './index') {
        filePath = './index.html';
    }
    else if (filePath.endsWith('.js')) {
        filePath = path.join('.', req.url);
    }
    else if (filePath.endsWith('.css')) {
        filePath = path.join('.', req.url);
    }
    else if (filePath.startsWith('./assets/')) {
        filePath = path.join('.', req.url);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png'
    }[ext] || 'application/octet-stream';

    try {
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data, 'utf-8');
    } catch (error) {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});