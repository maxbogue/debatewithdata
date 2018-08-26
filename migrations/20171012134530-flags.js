'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface
      .addColumn('claim_revs', 'flag', {
        type: DataTypes.TEXT,
      })
      .then(() =>
        queryInterface.addColumn('point_revs', 'flag', {
          type: DataTypes.TEXT,
        })
      );
  },

  down: queryInterface => {
    return queryInterface
      .removeColumn('claim_revs', 'flag')
      .then(() => queryInterface.removeColumn('point_revs', 'flag'));
  },
};
