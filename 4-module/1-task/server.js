const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  
  function sendStatusCode(statusCode) {
    res.statusCode = statusCode;
    res.end();
  }
  
  const pathname = url.parse(req.url).pathname.slice(1);
  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      
      const stream = fs.createReadStream(filepath);

      res.on('close', () => { // чтобы не отправлять в оборвавшийся connect
        if (res.finished) return;
        stream.destroy();
      });

      stream.on('error', (error) => {
        if (error.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found');
        } else {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
      stream.pipe(res);

      break;

    default:
      res.statusCode = 501;
      res.end('Not Implemented');
  }
});

module.exports = server;
