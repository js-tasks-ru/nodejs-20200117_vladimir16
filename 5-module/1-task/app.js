const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch(err) {
        if (!err.status) console.log(err);
        ctx.status = (err.status) ? err.status : 500;
        ctx.body = (err.status) ? err.message : 'Internal server error';
    }
});

app.use(require('koa-static')(__dirname + '/public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const clients = new Set();

router.get('/subscribe', async (ctx, next) => {
    ctx.body = await new Promise(resolve => {
        clients.add(resolve);
        ctx.res.on('close', function() {
            clients.delete(resolve);
            resolve();
        });
    });
});

router.post('/publish', async (ctx, next) => {
    const message = ctx.request.body.message;
    if (!message) ctx.throw(400);
    clients.forEach(resolve => resolve(message));
    clients.clear();
    ctx.status = 200;
});

app.use(router.routes());

module.exports = app;
