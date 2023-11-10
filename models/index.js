const sequelize = require('./_database');

// Importation des models
const Product = require('./Product');
const Tag = require('./Tag');
const User = require('./User');

// Déclaration des relations
Product.belongsToMany(Tag, { through: 'ProductTag' });
Tag.belongsToMany(Product, { through: 'ProductTag' });

// Synchronisation de la base
sequelize.sync({alter: true});

module.exports = {
    Product: Product,
    Tag: Tag,
    User: User,
}
