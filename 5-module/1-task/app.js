const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(__dirname + '/public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

router.get('/subscribe', async (ctx, next) => {
    const waitPublish = new Promise((resolve) => {
        ctx.app.once('publish', (message) => resolve(message));
    });
    ctx.req.once('aborted', () => ctx.app.emit('publish', ''));
    console.log(`количество слушателей ${ctx.app.listenerCount('publish')}`);
    const message = await waitPublish;
    if (message) ctx.body = message;
    else ctx.status = 404;
});

router.post('/publish', async (ctx, next) => {
    if (ctx.request.body.message) {
        ctx.app.emit('publish', ctx.request.body.message);
        ctx.status = 200;
    } else {
        return next();
    }
});

app.use(async (ctx, next) => {
    try {
        return next();
    } catch(error) {
        console.log('error !!!', error.message);
    }
});

app.use(router.routes());

module.exports = app;
