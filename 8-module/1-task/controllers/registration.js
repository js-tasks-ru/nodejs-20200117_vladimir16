const uuid = require('uuid/v4');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
    const token = uuid();
    let user;
    try {
        user = new User({email: ctx.request.body.email, displayName: ctx.request.body.displayName});
        await user.setPassword(ctx.request.body.password);
        user.verificationToken = token;
        await user.save({validateBeforeSave: true});
    } catch (error) {
        ctx.status = 400;
        ctx.body = {errors: {email: 'Такой email уже существует'}};
        return;
    }
    const resultMail = await sendMail({
        template: 'confirmation',
        locals: {token: token},
        to: ctx.request.body.email,
        subject: 'Подтвердите почту',
    });
    ctx.body = {status: 'ok'};
};

module.exports.confirm = async (ctx, next) => {
    const user = await User.findOne({verificationToken: ctx.request.body.verificationToken});
    if (!user) ctx.throw(400, 'Ссылка подтверждения недействительна или устарела');
    user.verificationToken = undefined;
    await user.save();
    const tokenSession = await ctx.login(user);
    ctx.body = {token: tokenSession};
};
