const Product = require('../models/Product');
const mapProduct = require('../mappers/product');
const mongoose = require('mongoose');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  ctx.productQuery = {};
  if (ctx.query.subcategory) ctx.productQuery = {subcategory: ctx.query.subcategory};
  return next();
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find(ctx.productQuery);
  if (products.length === 0) ctx.body = {products: []};
  else ctx.body = {products: products.map(mapProduct)};
};

module.exports.productById = async function productById(ctx, next) {
  if (mongoose.Types.ObjectId.isValid(ctx.params.id)) {
    const product = await Product.findOne({_id: ctx.params.id});
    if (product) ctx.body = {product: mapProduct(product)};
    else ctx.throw(404, 'product not found');
  }
  else ctx.throw(400, 'invalid id');
};

