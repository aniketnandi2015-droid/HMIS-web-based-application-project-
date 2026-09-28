import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 3000);
const root = 'public';
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript' };
createServer((request, response) => {
  const route = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const file = normalize(join(root, route));
  if (!file.startsWith(root) || !existsSync(file)) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`HMIS available at http://localhost:${port}`));
