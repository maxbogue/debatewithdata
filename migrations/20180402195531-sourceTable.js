'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('source_revs', 'table_hash', {
      type: Sequelize.TEXT,
      references: {
        model: 'blobs',
        key: 'hash',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('source_revs', 'table_hash');
  },
};
