const Order = require('../models/Order');
const sendMail = require('../libs/sendMail');
const mapOrder = require('../mappers/order');

module.exports.checkout = async function checkout(ctx, next) {
    const order = new Order({
        user: ctx.user.id,
        product: ctx.request.body.product,
        phone: ctx.request.body.phone,
        address: ctx.request.body.address
    });
    const newOrder = await order.save({validateBeforeSave: true});
    await sendMail({
        to: ctx.user.email,
        subject: 'Подтверждение заказа',
        locals: {id: newOrder.id, product: ctx.request.body.product},
        template: 'order-confirmation',
      });
    
    ctx.body = {order: newOrder.id};
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
    const orderList = await Order.find({user: ctx.user.id});
    ctx.body = {orders: []};
    for await (const order of orderList) ctx.body.orders.push(await mapOrder(order));
};
