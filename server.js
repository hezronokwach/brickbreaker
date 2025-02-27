import { readFile } from 'fs/promises';
import { createServer } from 'http';
import { extname, join } from 'path';

const server = createServer(async (req, res) => {
    let filePath = '.' + req.url;

    if (filePath === './' || filePath === './index') {
        filePath = './index.html';
    }
    else if (filePath.endsWith('.js')) {
        filePath = join('.', req.url);
    }
    else if (filePath.endsWith('.css')) {
        filePath = join('.', req.url);
    }
    else if (filePath.startsWith('./assets/')) {
        filePath = join('.', req.url);
    }

    const ext = extname(filePath).toLowerCase();
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
