'use strict';

module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('users', ['email'], {
      type: 'unique',
      name: 'users_email_key',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint('users', 'users_email_key');
  },
};
