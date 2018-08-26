'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('source_revs', 'chart', {
      type: Sequelize.TEXT,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('source_revs', 'chart');
  },
};
