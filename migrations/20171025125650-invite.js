'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface
      .createTable('invites', {
        code: {
          type: DataTypes.TEXT,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'users',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      })
      .then(() =>
        queryInterface.addColumn('users', 'admin', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        })
      );
  },

  down: queryInterface => {
    return queryInterface
      .dropTable('invites')
      .then(() => queryInterface.removeColumn('users', 'admin'));
  },
};
