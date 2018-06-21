'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.addColumn('users', 'email_verification_token', {
      type: DataTypes.TEXT,
    }).then(() => queryInterface.addColumn('users', 'password_reset_token', {
      type: DataTypes.TEXT,
    })).then(() => queryInterface.addColumn(
      'users', 'password_reset_expiration', { type: DataTypes.DATE }
    ));
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('users', 'email_verification_token')
      .then(() => queryInterface.removeColumn('users', 'password_reset_token'))
      .then(() => queryInterface.removeColumn(
        'users', 'password_reset_expiration'));
  }
};
