const { DataTypes } = require('sequelize');
const sequelize = require('./_database');

const Tag = sequelize.define('tag', {
    title:{
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = Tag