import { genRevId } from './utils';

export default function (sequelize, DataTypes) {
  const TopicRev = sequelize.define('topic_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    title: {
      type: DataTypes.TEXT,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  TopicRev.associate = function (models) {
    TopicRev.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
    });
    TopicRev.belongsTo(models.Topic, {
      foreignKey: {
        name: 'topicId',
        field: 'topic_id',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    TopicRev.belongsTo(models.Blob, {
      foreignKey: {
        name: 'blobHash',
        field: 'blob_hash',
      },
      onDelete: 'RESTRICT',
    });
    TopicRev.belongsTo(TopicRev, {
      as: 'parent',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id',
      },
      onDelete: 'RESTRICT',
    });
    TopicRev.Claims = TopicRev.belongsToMany(models.Claim, {
      through: models.TopicClaim,
      as: 'claims',
    });
  };

  TopicRev.postAssociate = function (models) {
    TopicRev.INCLUDE = function () {
      let include = [models.Blob, {
        association: TopicRev.Claims,
        ...models.Claim.INCLUDE(1),
      }];
      return { include };
    };
  };

  return TopicRev;
}
