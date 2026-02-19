const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'restaurants',
  timestamps: true,
  underscored: true
});

module.exports = Restaurant;

