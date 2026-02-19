module.exports = {
  up: async (queryInterface) => {
    // MySQL ENUM modification
    await queryInterface.sequelize.query(
      "ALTER TABLE users MODIFY status ENUM('PENDING','APPROVED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'APPROVED'",
    );
  },

  down: async (queryInterface) => {
    // Revert back to original ENUM (drops REJECTED)
    await queryInterface.sequelize.query(
      "ALTER TABLE users MODIFY status ENUM('PENDING','APPROVED','SUSPENDED') NOT NULL DEFAULT 'APPROVED'",
    );
  },
};
