'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.dropTable('point_points')
      .then(() => queryInterface.dropTable('claim_points'))
      .then(() => queryInterface.dropTable('point_revs'))
      .then(() => queryInterface.dropTable('points'));
  },

  down: (queryInterface, DataTypes) => {
    return queryInterface.createTable('points', {
      id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      head_id: {
        type: DataTypes.TEXT,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    }).then(() => queryInterface.createTable('point_revs', {
      id: {
        type: DataTypes.TEXT,
        primaryKey: true,
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      point_id: {
        type: DataTypes.TEXT,
        references: {
          model: 'points',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.INTEGER,
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
      claim_id: {
        type: DataTypes.TEXT,
        references: {
          model: 'claims',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      source_id: {
        type: DataTypes.TEXT,
        references: {
          model: 'sources',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      parent_id: {
        type: DataTypes.TEXT,
        references: {
          model: 'point_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    })).then(() => queryInterface.createTable('claim_points', {
      claim_rev_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'claim_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      point_rev_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'point_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_for: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    })).then(() => queryInterface.createTable('point_points', {
      point_rev_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'point_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subpoint_rev_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'point_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_for: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
  }
};
