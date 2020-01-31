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

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      if (/[^\w\.\- ]/.test(pathname)) sendStatusCode(400);
      else 
        fs.createReadStream(filepath)
          .on("error", () => {res.statusCode = 404; res.end();})
          .pipe(res);
      break;

    default:
      sendStatusCode(501);
  }
});

module.exports = server;
