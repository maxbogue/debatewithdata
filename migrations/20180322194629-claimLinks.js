'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface
      .createTable('claim_claims', {
        claim_rev_id: {
          type: DataTypes.TEXT,
          primaryKey: true,
          references: {
            model: 'claim_revs',
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
      })
      .then(() =>
        queryInterface.createTable('claim_sources', {
          claim_rev_id: {
            type: DataTypes.TEXT,
            primaryKey: true,
            references: {
              model: 'claim_revs',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          source_id: {
            type: DataTypes.TEXT,
            primaryKey: true,
            references: {
              model: 'sources',
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
        })
      );
  },

  down: queryInterface => {
    return queryInterface
      .dropTable('claim_claims')
      .then(() => queryInterface.dropTable('claim_sources'));
  },
};
