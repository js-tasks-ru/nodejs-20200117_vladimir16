module.exports = function map(product) {
    return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        subcategory: product.subcategory,
        images: product.images,
    };
}