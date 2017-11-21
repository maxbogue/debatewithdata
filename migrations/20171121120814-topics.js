'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('topics', {
      id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      head_id: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }).then(() => queryInterface.createTable('topic_revs', {
      id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      title: {
        type: DataTypes.TEXT,
      },
      topic_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
          model: 'topics',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      blob_hash: {
        type: DataTypes.TEXT,
        references: {
          model: 'blobs',
          key: 'hash',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      parent_id: {
        type: DataTypes.TEXT,
        references: {
          model: 'topic_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    })).then(() => queryInterface.createTable('topic_claims', {
      topic_rev_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'topic_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      claim_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'claims',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    }));
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('topic_claims')
      .then(() => queryInterface.dropTable('topic_revs'))
      .then(() => queryInterface.dropTable('topics'));
  },
};
