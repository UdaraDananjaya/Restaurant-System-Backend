const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  target_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'admin_logs',
  timestamps: true,
  underscored: true,
  updatedAt: false
});

module.exports = AdminLog;

