'use strict';

module.exports = {
  up: queryInterface => {
    return queryInterface.dropTable('invites');
  },

  down: (queryInterface, DataTypes) => {
    return queryInterface.createTable('invites', {
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
      note: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },
};
