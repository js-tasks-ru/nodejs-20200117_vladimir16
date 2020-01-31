const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    if (options.limit) this._limit = options.limit;
    else throw new ReferenceError("Do not set the value of options.limit");
  }

  _transform(chunk, encoding, callback) {
    this._limit -= chunk.length;
    if (this._limit >= 0) callback(null, chunk);
    else callback(new LimitExceededError());
  }
}

module.exports = LimitSizeStream;
