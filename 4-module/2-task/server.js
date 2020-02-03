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
      console.log('начальная дата', new Date());
      let writeFinished = false; // Взводится в обработчике finish
      let writeDestroyed = false; // Взводится перед принудительным вызовом writeStream.destroy()
      let wasWrited = false; // Взводится в обработчике finish если были байты для записи
      let reqDestroyed = false; // Взводится перед принудительным вызовом req.destroy()
      const limitStream = new limitSizeStream({limit: 1 * 1024 * 1024});
      const writeStream = fs.createWriteStream(filepath, {flags: "wx"});
      req.on("aborted", () => {
        if (reqDestroyed) return;
        writeDestroyed = true;
        writeStream.destroy();
        res.statusCode = 499;
        res.end('Client Closed Request');
      });
      limitStream.on("error", (error) => {
        reqDestroyed = true;
        writeDestroyed = true;
        res.statusCode = 413;
        res.end("File Too Large");
        console.log(`statusCode ${res.statusCode} дата`, new Date());
        req.destroy();
        writeStream.destroy();
      });
      writeStream.once("open", () => req.pipe(limitStream).pipe(writeStream));
      writeStream.once("finish", () => {
        if (writeDestroyed) return;
        writeFinished = true;
        wasWrited = writeStream.bytesWritten > 0;
      });
      writeStream.once("close", () => {
        if (writeFinished) {
          if (wasWrited) {
            res.statusCode = 201;
            res.end("OK");
          } else fs.unlink(filepath, (error) => res.end("OK"));
        } else fs.unlink(filepath, (error) => {console.log('файл удален', new Date())});
      });
      writeStream.on("error", (error) => {
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File Already Exists');
          reqDestroyed = true;
          req.destroy();
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
