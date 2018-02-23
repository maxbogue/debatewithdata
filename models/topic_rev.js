import map from 'lodash/map';

import { genRevId } from './utils';
import { validateTopic } from '../common/validate';

export default function (sequelize, DataTypes) {
  const TopicRev = sequelize.define('topic_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    title: {
      type: DataTypes.TEXT,
      validate: validateTopic.title.forDb,
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
    TopicRev.INCLUDE = function (n, includeUser=false) {
      let include = [models.Blob, {
        association: TopicRev.Claims,
        ...models.Claim.INCLUDE(1),
      }];
      if (includeUser) {
        include.push(models.User);
      }
      if (n > 1) {
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
        for (let subTopicData of data.newSubTopics) {
          await models.Topic.apiCreate(user, subTopicData, transaction);
          subTopicIds.push(subTopicData.id);
        }
      }

      await topicRev.addClaims(data.claimIds, { transaction });
      await topicRev.addSubTopics(subTopicIds, { transaction });
      await topic.setHead(topicRev, { transaction });

      return topicRev;
    };

    TopicRev.prototype.fillData = async function (data) {
      let thisData = {};
      thisData.id = this.id;
      thisData.username = this.user.username;
      thisData.createdAt = this.created_at;

      if (this.deleted) {
        thisData.deleted = true;
      } else {
        thisData.text = this.blob.text;
        thisData.title = this.title;
        thisData.subTopicIds = map(this.subTopics, (topic) => topic.id);
        thisData.claimIds = map(this.claims, (claim) => claim.id);

        for (let subTopic of this.subTopics) {
          await subTopic.fillData(data, 1);
        }

        for (let claim of this.claims) {
          await claim.fillData(data, 1);
        }
      }

      data.topicRevs.push(thisData);
    };
  };

  return TopicRev;
}
