'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface
      .createTable('blobs', {
        hash: {
          type: DataTypes.TEXT,
          primaryKey: true,
        },
        text: {
          type: DataTypes.TEXT,
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
        queryInterface.createTable('users', {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
          },
          password_hash: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
          email: {
            type: DataTypes.TEXT,
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
      )
      .then(() =>
        queryInterface.createTable('claims', {
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
        })
      )
      .then(() =>
        queryInterface.createTable('claim_revs', {
          id: {
            type: DataTypes.TEXT,
            primaryKey: true,
          },
          claim_id: {
            type: DataTypes.TEXT,
            references: {
              model: 'claims',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          user_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'users',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          blob_hash: {
            type: DataTypes.TEXT,
            references: {
              model: 'blobs',
              key: 'hash',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          parent_id: {
            type: DataTypes.TEXT,
            references: {
              model: 'claim_revs',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          deleted: {
            type: DataTypes.BOOLEAN,
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
        })
      )
      .then(() =>
        queryInterface.createTable('sources', {
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
        })
      )
      .then(() =>
        queryInterface.createTable('source_revs', {
          id: {
            type: DataTypes.TEXT,
            primaryKey: true,
          },
          url: {
            type: DataTypes.TEXT,
          },
          ary: {
            type: DataTypes.INTEGER,
          },
          source_id: {
            type: DataTypes.TEXT,
            references: {
              model: 'sources',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          user_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'users',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          blob_hash: {
            type: DataTypes.TEXT,
            references: {
              model: 'blobs',
              key: 'hash',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          parent_id: {
            type: DataTypes.TEXT,
            references: {
              model: 'source_revs',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
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
        })
      )
      .then(() =>
        queryInterface.createTable('points', {
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
        })
      )
      .then(() =>
        queryInterface.createTable('point_revs', {
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
            onDelete: 'SET NULL',
          },
          user_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'users',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          blob_hash: {
            type: DataTypes.TEXT,
            references: {
              model: 'blobs',
              key: 'hash',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          claim_id: {
            type: DataTypes.TEXT,
            references: {
              model: 'claims',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          source_id: {
            type: DataTypes.TEXT,
            references: {
              model: 'sources',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          parent_id: {
            type: DataTypes.TEXT,
            references: {
              model: 'point_revs',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
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
      )
      .then(() =>
        queryInterface.createTable('claim_points', {
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
        })
      )
      .then(() =>
        queryInterface.createTable('point_points', {
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
        })
      )
      .then(() =>
        queryInterface.createTable('comments', {
          id: {
            type: DataTypes.TEXT,
            primaryKey: true,
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION',
          },
          commentable: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
          commentable_id: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
          text: {
            type: DataTypes.TEXT,
            allowNull: false,
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
        })
      )
      .then(() =>
        queryInterface.createTable(
          'stars',
          {
            id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true,
            },
            user_id: {
              type: DataTypes.INTEGER,
              allowNull: false,
            },
            starrable: {
              type: DataTypes.TEXT,
              allowNull: false,
            },
            starrable_id: {
              type: DataTypes.TEXT,
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
          },
          {
            uniqueKeys: {
              star_starrable: {
                fields: ['user_id', 'starrable', 'starrable_id'],
              },
            },
          }
        )
      );
  },
  down: queryInterface => {
    return queryInterface.dropAllTables();
  },
};
