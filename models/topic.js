import { NotFoundError } from '../api/error';
import { ValidationError, validateTopic } from '../common/validate';

export default function (sequelize, DataTypes) {
  const Topic = sequelize.define('topic', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      validate: validateTopic.id.forDb,
    },
  });

  Topic.associate = function (models) {
    Topic.Head = Topic.belongsTo(models.TopicRev, {
      as: 'head',
      foreignKey: {
        name: 'headId',
        field: 'head_id',
      },
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Topic.hasMany(models.TopicRev, {
      as: 'revs',
    });
    Topic.belongsToMany(models.User, {
      as: 'starredByUsers',
      through: {
        model: models.Star,
        unique: false,
        scope: {
          starrable: 'topic',
        }
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Topic.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: 'topic',
      },
    });
  };

  Topic.postAssociate = function (models) {
    Topic.INCLUDE = function (n) {
      return {
        include: [{
          association: Topic.Head,
          ...models.TopicRev.INCLUDE(n),
        }],
      };
    };

    Topic.apiCreate = async function (user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiCreate(user, data, t);
        });
      }

      validateTopic(data);

      try {
        const topic = await Topic.create({ id: data.id }, { transaction });
        return models.TopicRev.createForApi(topic, user, data, transaction);
      } catch (e) {
        if (e instanceof sequelize.UniqueConstraintError) {
          throw new ValidationError(`"${e.errors[0].path}" must be unique.`);
        }
        throw e;
      }
    };

    Topic.apiUpdate = async function (id, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiUpdate(id, user, data, t);
        });
      }

      validateTopic(data);

      const topic = await Topic.findById(id, Topic.INCLUDE(3));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }

      return models.TopicRev.createForApi(topic, user, data, transaction);
    };

    Topic.apiDelete = async function (id, user, msg, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiDelete(id, user, msg, t);
        });
      }

      let topic = await Topic.findById(id, Topic.INCLUDE(3));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }

      if (!msg) {
        throw new ValidationError('deleteMessage', 'must exist.');
      }

      if (topic.head.deleted) {
        return topic.head;
      }

      let topicRev = await models.TopicRev.create({
        userId: user.id,
        topicId: topic.id,
        parentId: topic.headId,
        deleted: true,
        deleteMessage: msg,
      });
      await topic.setHead(topicRev);
      return topicRev;
    };

    Topic.prototype.fillData = async function (data, depth, user) {
      if (data.topics[this.id] && data.topics[this.id].depth >= depth) {
        // This topic has already been loaded with at least as much depth.
        return;
      }

      let thisData = this.head.toCoreData();
      thisData.depth = this.head.deleted ? 3 : depth;
      thisData.star = await this.toStarData(user);
      thisData.commentCount = await this.countComments();

      if (!this.head.deleted && depth > 1) {
        for (let subTopic of this.head.subTopics) {
          await subTopic.fillData(data, depth - 1, user);
        }
        for (let claim of this.head.claims) {
          await claim.fillData(data, depth - 1, user);
        }
      }

      data.topics[this.id] = thisData;
    };

    Topic.apiGet = async function (id, user) {
      let topic = await Topic.findById(id, Topic.INCLUDE(3));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }
      let data = { topics: {}, claims: {} };
      await topic.fillData(data, 3, user);
      return data;
    };

    Topic.apiGetAll = async function (user, topicIds) {
      let query = {};
      if (topicIds) {
        query.where = { id: topicIds };
      }
      let topics = await Topic.findAll({
        ...query,
        ...Topic.INCLUDE(1),
      });
      let data = { topics: {}, claims: {} };
      for (let topic of topics) {
        if (!topic.head.deleted) {
          await topic.fillData(data, 1, user);
        }
      }
      return data;
    };

    Topic.apiGetRevs = async function (topicId) {
      let topicRevs = await models.TopicRev.findAll({
        where: { topicId },
        order: [['created_at', 'DESC']],
        ...models.TopicRev.INCLUDE(2, true),
      });

      if (topicRevs.length === 0) {
        throw new NotFoundError('Topic not found: ' + topicId);
      }

      let data = {
        topicRevs: [],
        topics: {},
        claims: {},
      };
      for (let topicRev of topicRevs) {
        await topicRev.fillData(data);
      }
      return data;
    };

    Topic.prototype.toStarData = async function (user) {
      let count = await this.countStarredByUsers();
      let starred = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
      }
      return { count, starred };
    };

    Topic.apiToggleStar = async function (id, user) {
      let topic = await Topic.findById(id);
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }
      let isStarred = await topic.hasStarredByUser(user);
      if (isStarred) {
        await topic.removeStarredByUser(user);
      } else {
        await topic.addStarredByUser(user);
      }
      return await topic.toStarData(user);
    };
  };

  return Topic;
}
