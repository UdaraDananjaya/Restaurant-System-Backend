module.exports = {

};
  }
    await queryInterface.dropTable('restaurants');
  down: async (queryInterface, Sequelize) => {

  },
    });
      }
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        allowNull: false,
        type: Sequelize.DATE,
      updated_at: {
      },
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        allowNull: false,
        type: Sequelize.DATE,
      created_at: {
      },
        allowNull: true
        type: Sequelize.TEXT,
      image: {
      },
        defaultValue: 'ACTIVE'
        allowNull: false,
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
      status: {
      },
        allowNull: false
        type: Sequelize.STRING(255),
      name: {
      },
        onDelete: 'CASCADE'
        onUpdate: 'CASCADE',
        },
          key: 'id'
          model: 'users',
        references: {
        allowNull: false,
        type: Sequelize.INTEGER,
      seller_id: {
      },
        autoIncrement: true
        primaryKey: true,
        type: Sequelize.INTEGER,
      id: {
    await queryInterface.createTable('restaurants', {
  up: async (queryInterface, Sequelize) => {
