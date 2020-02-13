const Product = require('../models/Product');
const mapProduct = require('../mappers/product');

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  if (ctx.query.query) {
    const products = await Product.find({$text: {$search: ctx.query.query}}, {score: {$meta: "textScore" }}).sort({score: {$meta: "textScore" }});
    //const products = await Product.find({$text: {$search: ctx.query.query}});
    if (products.lengths === 0) ctx.body = {products: []};
    else ctx.body = {products: products.map(mapProduct)};
  } else ctx.body = {products: []};
};
