'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('source_revs', 'delete_message', {
      type: Sequelize.TEXT,
    }).then(() => queryInterface.addColumn('claim_revs', 'delete_message', {
      type: Sequelize.TEXT,
    })).then(() => queryInterface.addColumn('topic_revs', 'delete_message', {
      type: Sequelize.TEXT,
    }));
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('source_revs', 'delete_message')
      .then(() => queryInterface.removeColumn('claim_revs', 'delete_message'))
      .then(() => queryInterface.removeColumn('topic_revs', 'delete_message'));
  },
};
