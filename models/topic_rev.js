import { genRevId } from './utils';
import { ValidationError, validateTopic } from '../common/validate';

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
    deleteMessage: {
      field: 'delete_message',
      type: DataTypes.TEXT,
      validate: validateTopic.deleteMessage.forDb,
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
      let include = [models.Blob];
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

    TopicRev.createForApi = async function (topic, user, data, transaction) {
      const blob = await models.Blob.fromText(data.text, transaction);
      const topicRev = await models.TopicRev.create({
        title: data.title,
        userId: user.id,
        topicId: topic.id,
        parentId: topic.headId,
        blobHash: blob.hash,
      }, { transaction });

      let subTopicIds = [...data.subTopicIds];
      let claimIds = [...data.claimIds];

      let rootSubTopics = await models.Topic.findAll({
        where: { id: subTopicIds, isRoot: true },
        attributes: ['id'],
      });

      if (rootSubTopics.length > 0) {
        throw new ValidationError(`subTopicIds[${rootSubTopics[0].id}]`,
            'root topics cannot be sub-topics.');
      }

      if (data.newSubTopics) {
        for (let subTopicData of data.newSubTopics) {
          await models.Topic.apiCreate(user, subTopicData, false, transaction);
          subTopicIds.push(subTopicData.id);
        }
      }

      if (data.newClaims) {
        for (let claimData of data.newClaims) {
          let rev = await models.Claim.apiCreate(user, claimData, transaction);
          claimIds.push(rev.claimId);
        }
      }

      await topicRev.addClaims(claimIds, { transaction });
      await topicRev.addSubTopics(subTopicIds, { transaction });
      await topic.setHead(topicRev, { transaction });

      topic.updateGraph(subTopicIds, claimIds);

      return topicRev;
    };

    TopicRev.prototype.toCoreData = function () {
      let data = {
        id: this.topicId,
        revId: this.id,
      };

      if (this.deleted) {
        data.deleted = true;
        data.deleteMessage = this.deleteMessage;
        return data;
      }

      data.text = this.blob.text;
      data.title = this.title;
      if (this.subTopics) {
        data.subTopicIds = this.subTopics.map((topic) => topic.id);
      }
      if (this.claims) {
        data.claimIds = this.claims.map((claim) => claim.id);
      }
      return data;
    };

    // Only called for apiGetRevs.
    TopicRev.prototype.fillData = async function (data) {
      let thisData = this.toCoreData();
      thisData.username = this.user.username;
      thisData.createdAt = this.created_at;

      if (!this.deleted) {
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
