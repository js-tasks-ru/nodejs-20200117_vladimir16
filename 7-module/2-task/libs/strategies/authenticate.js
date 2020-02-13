const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) return done(null, false, 'Не указан email');
  try {
    await User.validate({email: email}, ['email']);
  } catch (error) {
    done(error, false, 'Некорректный email.');
  }
  const user = await User.findOne({email: email});
  if (user) return done(null, user);
  const newuser = await User.create({email: email, displayName: email});
  done(null, newuser);
};
