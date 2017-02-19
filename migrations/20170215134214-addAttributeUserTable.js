'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'User',
      'firstName',
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    );

    queryInterface.addColumn(
      'User',
      'lastName',
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    );

    return queryInterface.addColumn(
      'User',
      'pathProfilPicture',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
    /*
    Add altering commands here.
    Return a promise to correctly handle asynchronicity.

    Example:
    return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: function (queryInterface, Sequelize) {
    /*
    Add reverting commands here.
    Return a promise to correctly handle asynchronicity.

    Example:
    return queryInterface.dropTable('users');
    */
  }
};
