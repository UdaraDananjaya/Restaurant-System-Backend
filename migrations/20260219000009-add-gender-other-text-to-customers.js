module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customers", "gender_other_text", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("customers", "gender_other_text");
  },
};
