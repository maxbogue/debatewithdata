'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.addColumn('source_revs', 'date', {
      type: DataTypes.TEXT,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('source_revs', 'date');
  }
};
