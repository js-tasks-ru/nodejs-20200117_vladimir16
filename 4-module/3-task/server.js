const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  if (pathname.includes('/') || pathname.includes('..')) {
    res.writeHead(400).end("Bad Request");
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, (error) => {
        if (error) {
          if (error.code === 'ENOENT') res.writeHead(404).end('File not found');
          else res.writeHead(500).end('Internal server error');
        } else res.writeHead(200).end('File has been deleted');
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
