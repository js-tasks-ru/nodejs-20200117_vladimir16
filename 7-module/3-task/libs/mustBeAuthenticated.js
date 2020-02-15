module.exports = function mustBeAuthenticated(ctx, next) {
  if (ctx.user) return next();
  else ctx.throw(401, 'Пользователь не залогинен');
};
