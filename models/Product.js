const { DataTypes } = require('sequelize');
const sequelize = require('./_database');

const Product = sequelize.define('Product', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }, 
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
})

module.exports = Product