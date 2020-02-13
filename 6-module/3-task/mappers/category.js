function mapSubcategory(subcategory) {
    return {
        id: subcategory.id,
        title: subcategory.title
    };
}

module.exports = function map(category) {
    return {
        id: category.id,
        title: category.title,
        subcategories: category.subcategories.map(mapSubcategory)
    };
}