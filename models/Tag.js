const { DataTypes } = require('sequelize');
const sequelize = require('./_database');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    indexes: [
        {unique: true, fields: ['name']},
    ]
})

module.exports = Tag