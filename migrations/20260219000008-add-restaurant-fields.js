module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("restaurants", "contact_number", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn("restaurants", "address", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("restaurants", "cuisines", {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("restaurants", "cuisines");
    await queryInterface.removeColumn("restaurants", "address");
    await queryInterface.removeColumn("restaurants", "contact_number");
  },
};
