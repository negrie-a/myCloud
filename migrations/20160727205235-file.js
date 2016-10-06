'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable( 'File', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        fk_user_id: {
          type: Sequelize.INTEGER,
          //allowNull: false, // A remettre et envoyé le fk_user_id par request depuis le client ( bis )
          references: {
            model: 'User',
            key: 'id'
          },
        },
        name: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        pathDevice: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        pathServer: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        size: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        status: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE,
        },
        updatedAt: {
          type: Sequelize.DATE,
        }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('File')
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
