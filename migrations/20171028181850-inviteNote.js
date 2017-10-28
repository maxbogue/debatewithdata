'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.addColumn('invites', 'note', {
      type: DataTypes.TEXT,
      allowNull: false,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('invites', 'note');
  }
};
