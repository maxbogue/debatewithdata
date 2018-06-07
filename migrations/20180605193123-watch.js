'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('watches', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      watchable: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      watchable_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }, {
      uniqueKeys: {
        watch_watchable: {
          fields: ['user_id', 'watchable', 'watchable_id'],
        },
      },
    }).then(() => queryInterface.addColumn('users', 'caught_up_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    }));
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('watches')
      .then(() => queryInterface.removeColumn('users', 'caught_up_at'));
  }
};
