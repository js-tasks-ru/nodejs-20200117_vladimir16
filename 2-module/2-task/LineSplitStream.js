const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._buf = "";
    let a = os.EOL;
    this._lenEOL = a.length;
  }

  _transform(chunk, encoding, callback) {
    this._buf += chunk;
    let indEOL = this._buf.indexOf(os.EOL);
    while (indEOL >= 0) {
      let pushData = this._buf.slice(0, indEOL);
      if (pushData.length) {
        this.push(pushData);
      }
      let indSub = indEOL + this._lenEOL;
      this._buf = this._buf.substr(indSub);
      indEOL = this._buf.indexOf(os.EOL);
    }
    callback(null);
  }

  _flush(callback) {
    if (this._buf.length) {
      this.push(this._buf);
      callback(null);
    }
  }
}

module.exports = LineSplitStream;
