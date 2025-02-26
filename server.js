import { readFile } from 'fs/promises';
import { createServer } from 'http';
import { extname, join } from 'path';

const server = createServer(async (req, res) => {
    let filePath = '.' + req.url;

    // Serve index.html when accessing root
    if (filePath === './' || filePath === './index') {
        filePath = './index.html';
    }
    // Ensure JavaScript files are correctly served from /script/
    else if (filePath.endsWith('.js')) {
        filePath = join('.', req.url);
    }
    // Serve CSS files correctly
    else if (filePath.endsWith('.css')) {
        filePath = join('.', req.url);
    }
    // Serve images and assets correctly
    else if (filePath.startsWith('./assets/')) {
        filePath = join('.', req.url);
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',  // ✅ Ensure JavaScript is served correctly
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
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
