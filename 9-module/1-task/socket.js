const socketIO = require('socket.io');

const Session = require('./models/Session');
const User = require('./models/User');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const token = socket.handshake.query.token;
    if (!token) return next(new Error('anonymous sessions are not allowed'));
    const session = await Session.findOne({token: token});
    if (!session) return next(new Error('wrong or expired session token'));
    socket.user = await User.findById(session.user);
    return next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      const message = new Message({
        date: new Date(),
        text: msg,
        chat: socket.user.id,
        user: socket.user.displayName
      });
      message.save({validateBeforeSave: true});
    });
  });

  return io;
}

module.exports = socket;
