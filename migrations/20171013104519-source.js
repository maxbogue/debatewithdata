'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.addColumn('source_revs', 'type', {
      type: DataTypes.TEXT,
    }).then(() => queryInterface.addColumn('source_revs', 'institution', {
      type: DataTypes.TEXT,
    })).then(() => queryInterface.addColumn('source_revs', 'publication', {
      type: DataTypes.TEXT,
    })).then(() => queryInterface.addColumn('source_revs', 'first_hand', {
      type: DataTypes.BOOLEAN,
    })).then(() => queryInterface.sequelize.query(
      'UPDATE source_revs SET type = \'misc\' WHERE deleted = false;'
    )).then(() => queryInterface.removeColumn('source_revs', 'ary'));
  },

  down: (queryInterface, DataTypes) => {
    return queryInterface.addColumn('source_revs', 'ary', {
      type: DataTypes.INTEGER,
    }).then(() => queryInterface.removeColumn('source_revs', 'type'))
      .then(() => queryInterface.removeColumn('source_revs', 'institution'))
      .then(() => queryInterface.removeColumn('source_revs', 'publication'))
      .then(() => queryInterface.removeColumn('source_revs', 'first_hand'));
  }
};
