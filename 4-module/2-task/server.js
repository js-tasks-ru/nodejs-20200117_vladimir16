const url = require('url');
const http = require('http');
const path = require('path');
const fs = require("fs");
const limitSizeStream = require("./LimitSizeStream");

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      let writeFinished = false; // Взводится в обработчике finish
      //let writeDestroyed = false; // Взводится перед принудительным вызовом writeStream.destroy()
      let wasWrited = false; // Взводится в обработчике finish если были байты для записи
      let wasErrorLimit = false; 
      const limitStream = new limitSizeStream({limit: 5 * 1024 * 1024});
      const writeStream = fs.createWriteStream(filepath, {flags: "wx"});
      req.on("aborted", () => {
        writeStream.destroy();
        res.statusCode = 499;
        res.end('Client Closed Request');
      });
      limitStream.on("error", (error) => {
        if (wasErrorLimit) return;
        wasErrorLimit = true;
        res.setHeader('Connection', 'close');
        res.statusCode = 413;
        res.end("File Too Large");
        writeStream.destroy();
      });
      //writeStream.once("open", () => req.pipe(limitStream).pipe(writeStream));
      writeStream.once("open", () => req.pipe(writeStream));
      writeStream.once("finish", () => {
        writeFinished = true;
        wasWrited = writeStream.bytesWritten > 0;
        if(writeStream.bytesWritten <= (1 * 1024 * 1024)) return;
        wasWrited = false;
        wasErrorLimit = true;
      });
      writeStream.once("close", () => {
        if (writeFinished) {
          if (wasWrited) {
            res.statusCode = 201;
            res.end("OK");
          } else fs.unlink(filepath, (error) => {
            if (wasErrorLimit) {
              res.statusCode = 413;
              res.end("File Too Large");
            } else {
              res.end("OK");
            }
          });
        } else fs.unlink(filepath, (error) => {});
      });
      writeStream.on("error", (error) => {
        if (error.code === 'EEXIST') {
          res.setHeader('Connection', 'close');
          res.statusCode = 409;
          res.end('File Already Exists');
        }
      });
            
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
