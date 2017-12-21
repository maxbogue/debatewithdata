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
    TopicRev.SubTopics = TopicRev.belongsToMany(models.Topic, {
      through: models.TopicTopic,
      as: 'subTopics',
      otherKey: 'sub_topic_id',
      onDelete: 'RESTRICT',
    });
  };

  TopicRev.postAssociate = function (models) {
    TopicRev.INCLUDE = function (n) {
      let include = [models.Blob, {
        association: TopicRev.Claims,
        ...models.Claim.INCLUDE(1),
      }];
      if (n > 1 ) {
        include.push({
          association: TopicRev.SubTopics,
          ...models.Topic.INCLUDE(n - 1),
        });
      }
      return { include };
    };

    TopicRev.createForApi = async function (topic, user, data, transaction) {
      const blob = await models.Blob.fromText(data.text, transaction);
      const topicRev = await models.TopicRev.create({
        title: data.title,
        userId: user.id,
        topicId: topic.id,
        parentId: topic.headId,
        blobHash: blob.hash,
      }, { transaction });

      let subTopicIds = data.subTopicIds;

      if (data.newSubTopics) {
        let newSubTopicIds = Object.keys(data.newSubTopics);
        for (let subTopicId of newSubTopicIds) {
          let subTopicData = data.newSubTopics[subTopicId];
          await models.Topic.apiCreate(user, subTopicData, transaction);
        }
        subTopicIds = subTopicIds.concat(newSubTopicIds);
      }

      await topicRev.addClaims(data.claimIds, { transaction });
      await topicRev.addSubTopics(subTopicIds, { transaction });
      await topic.setHead(topicRev, { transaction });

      return topicRev;
    };
  };

  return TopicRev;
}
