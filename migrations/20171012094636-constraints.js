'use strict';
/* eslint indent: "off" */

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.removeConstraint('claim_revs',
      'claim_revs_blob_hash_fkey'
    ).then(() => queryInterface.addConstraint('claim_revs', ['blob_hash'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_blob_hash_fkey',
      references: {
        table: 'blobs',
        field: 'hash',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('claim_revs',
      'claim_revs_claim_id_fkey'
    )).then(() => queryInterface.addConstraint('claim_revs', ['claim_id'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_claim_id_fkey',
      references: {
        table: 'claims',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })).then(() => queryInterface.removeConstraint('claim_revs',
      'claim_revs_parent_id_fkey'
    )).then(() => queryInterface.addConstraint('claim_revs', ['parent_id'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_parent_id_fkey',
      references: {
        table: 'claim_revs',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('claim_revs',
      'claim_revs_user_id_fkey'
    )).then(() => queryInterface.addConstraint('claim_revs', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('comments',
      'comments_user_id_fkey'
    )).then(() => queryInterface.addConstraint('comments', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'comments_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_blob_hash_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['blob_hash'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_blob_hash_fkey',
      references: {
        table: 'blobs',
        field: 'hash',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_claim_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['claim_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_claim_id_fkey',
      references: {
        table: 'claims',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_parent_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['parent_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_parent_id_fkey',
      references: {
        table: 'point_revs',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_point_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['point_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_point_id_fkey',
      references: {
        table: 'points',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_source_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['source_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_source_id_fkey',
      references: {
        table: 'sources',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_user_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_blob_hash_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['blob_hash'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_blob_hash_fkey',
      references: {
        table: 'blobs',
        field: 'hash',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_parent_id_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['parent_id'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_parent_id_fkey',
      references: {
        table: 'source_revs',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_source_id_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['source_id'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_source_id_fkey',
      references: {
        table: 'sources',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_user_id_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })).then(() => queryInterface.addConstraint('stars', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'stars_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })).then(() => queryInterface.changeColumn('claim_revs', 'deleted', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })).then(() => queryInterface.changeColumn('claim_revs', 'claim_id', {
      type: DataTypes.TEXT,
      allowNull: false,
    })).then(() => queryInterface.changeColumn('claim_revs', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
    })).then(() => queryInterface.changeColumn('point_revs', 'point_id', {
      type: DataTypes.TEXT,
      allowNull: false,
    })).then(() => queryInterface.changeColumn('point_revs', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
    })).then(() => queryInterface.changeColumn('source_revs', 'source_id', {
      type: DataTypes.TEXT,
      allowNull: false,
    })).then(() => queryInterface.changeColumn('source_revs', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
    }));
  },

  down: (queryInterface, DataTypes) => {
    return queryInterface.changeColumn('claim_revs', 'deleted', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }).then(() => queryInterface.changeColumn('claim_revs', 'claim_id', {
      type: DataTypes.TEXT,
      allowNull: true,
    })).then(() => queryInterface.changeColumn('claim_revs', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })).then(() => queryInterface.changeColumn('point_revs', 'point_id', {
      type: DataTypes.TEXT,
      allowNull: true,
    })).then(() => queryInterface.changeColumn('point_revs', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })).then(() => queryInterface.changeColumn('source_revs', 'source_id', {
      type: DataTypes.TEXT,
      allowNull: true,
    })).then(() => queryInterface.changeColumn('source_revs', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })).then(() => queryInterface.removeConstraint('claim_revs',
      'claim_revs_blob_hash_fkey'
    )).then(() => queryInterface.addConstraint('claim_revs', ['blob_hash'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_blob_hash_fkey',
      references: {
        table: 'blobs',
        field: 'hash',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('claim_revs',
      'claim_revs_claim_id_fkey'
    )).then(() => queryInterface.addConstraint('claim_revs', ['claim_id'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_claim_id_fkey',
      references: {
        table: 'claims',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('claim_revs',
      'claim_revs_parent_id_fkey'
    )).then(() => queryInterface.addConstraint('claim_revs', ['parent_id'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_parent_id_fkey',
      references: {
        table: 'claim_revs',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('claim_revs',
      'claim_revs_user_id_fkey'
    )).then(() => queryInterface.addConstraint('claim_revs', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'claim_revs_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('comments',
      'comments_user_id_fkey'
    )).then(() => queryInterface.addConstraint('comments', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'comments_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_blob_hash_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['blob_hash'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_blob_hash_fkey',
      references: {
        table: 'blobs',
        field: 'hash',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_claim_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['claim_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_claim_id_fkey',
      references: {
        table: 'claims',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_parent_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['parent_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_parent_id_fkey',
      references: {
        table: 'point_revs',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_point_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['point_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_point_id_fkey',
      references: {
        table: 'points',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_source_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['source_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_source_id_fkey',
      references: {
        table: 'sources',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('point_revs',
      'point_revs_user_id_fkey'
    )).then(() => queryInterface.addConstraint('point_revs', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'point_revs_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_blob_hash_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['blob_hash'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_blob_hash_fkey',
      references: {
        table: 'blobs',
        field: 'hash',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_parent_id_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['parent_id'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_parent_id_fkey',
      references: {
        table: 'source_revs',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_source_id_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['source_id'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_source_id_fkey',
      references: {
        table: 'sources',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('source_revs',
      'source_revs_user_id_fkey'
    )).then(() => queryInterface.addConstraint('source_revs', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'source_revs_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })).then(() => queryInterface.removeConstraint('stars',
      'stars_user_id_fkey'
    ));
  }
};
