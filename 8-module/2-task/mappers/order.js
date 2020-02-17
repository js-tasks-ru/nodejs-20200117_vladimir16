const Order = require('../models/Order');

module.exports = async function mapOrder(order) {
    const orderProduct = await order.populate('product').execPopulate();
    return {
        id: orderProduct.id,
        user: orderProduct.user,
        phone: orderProduct.phone,
        address: orderProduct.address,
        product: {
            id: orderProduct.product.id,
            title: orderProduct.product.title,
            images: orderProduct.product.images,
            category: orderProduct.product.category,
            subcategory: orderProduct.product.subcategory,
            price: orderProduct.product.price,
            description: orderProduct.product.description
        }
    };
};
  