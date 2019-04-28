import { ValidationError, validateTopic } from '@/common/validate';
import { genRevId } from './utils';

export default function(sequelize, DataTypes) {
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
    deleteMessage: {
      field: 'delete_message',
      type: DataTypes.TEXT,
      validate: validateTopic.deleteMessage.forDb,
    },
  });

  TopicRev.associate = function(models) {
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

  TopicRev.postAssociate = function(models) {
    TopicRev.INCLUDE = function(n, includeUser = false) {
      const include = [models.Blob];
      if (includeUser) {
        include.push(models.User);
      }
      if (n > 1) {
        include.push({
          association: TopicRev.SubTopics,
          ...models.Topic.INCLUDE(n - 1),
        });
        include.push({
          association: TopicRev.Claims,
          ...models.Claim.INCLUDE(n - 1),
        });
      }
      return { include };
    };

    TopicRev.createForApi = async function(topic, user, data, transaction) {
      const blob = await models.Blob.fromText(data.text, transaction);
      const topicRev = await models.TopicRev.create(
        {
          title: data.title,
          userId: user.id,
          topicId: topic.id,
          parentId: topic.headId,
          blobHash: blob.hash,
        },
        { transaction }
      );

      const subTopicIds = [...data.subTopicIds];
      const claimIds = [...data.claimIds];

      const rootSubTopics = await models.Topic.findAll({
        where: { id: subTopicIds, isRoot: true },
        attributes: ['id'],
      });

      if (rootSubTopics.length > 0) {
        throw new ValidationError(
          `subTopicIds[${rootSubTopics[0].id}]`,
          'root topics cannot be sub-topics.'
        );
      }

      const promises = [];

      if (data.newSubTopics) {
        for (const subTopicData of data.newSubTopics) {
          promises.push(
            models.Topic.apiCreate(user, subTopicData, false, transaction)
          );
          subTopicIds.push(subTopicData.id);
        }
      }

      if (data.newClaims) {
        for (const claimData of data.newClaims) {
          promises.push(
            models.Claim.apiCreate(user, claimData, transaction).then(rev => {
              claimIds.push(rev.claimId);
            })
          );
        }
      }

      await Promise.all(promises);
      await topicRev.addClaims(claimIds, { transaction });
      await topicRev.addSubTopics(subTopicIds, { transaction });
      await topic.setHead(topicRev, { transaction });
      await topic.addWatchedByUser(user);

      topic.updateGraph(subTopicIds, claimIds);
      topic.updateIndex({ id: topic.id, text: data.text, title: data.title });

      return topicRev;
    };

    TopicRev.prototype.getItemId = function() {
      return this.topicId;
    };

    TopicRev.prototype.toCoreData = function() {
      const data = {
        id: this.topicId,
        revId: this.id,
        updatedAt: this.created_at,
      };

      if (this.deleted) {
        data.deleted = true;
        data.deleteMessage = this.deleteMessage;
        return data;
      }

      data.text = this.blob.text;
      data.title = this.title;
      if (this.subTopics) {
        data.subTopicIds = this.subTopics.map(topic => topic.id);
      }
      if (this.claims) {
        data.claimIds = this.claims.map(claim => claim.id);
      }
      return data;
    };

    // Only called for apiGetRevs.
    TopicRev.prototype.fillData = async function(data, user) {
      const thisData = this.toCoreData();
      thisData.username = this.user.username;
      thisData.createdAt = this.created_at;

      if (!this.deleted) {
        const promises = [];
        for (const subTopic of this.subTopics) {
          promises.push(subTopic.fillData(data, 1, user));
        }
        for (const claim of this.claims) {
          promises.push(claim.fillData(data, 1, user));
        }
        await Promise.all(promises);
      }

      return thisData;
    };
  };

  return TopicRev;
}
