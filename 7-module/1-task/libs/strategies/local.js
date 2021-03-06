const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {session: false, usernameField: 'email'},
    async function(email, password, done) {
      try {
        await User.validate({email: email}, ['email']);
      } catch (error) {
        done(error, false, 'Некорректный email.');
      }
      const user = await User.findOne({email: email});
      if (!user) done(null, false, 'Нет такого пользователя');
      const checkPassword = await user.checkPassword(password);
      if (checkPassword) done(null, user);
      else done(null, false, 'Неверный пароль');
    }
);
