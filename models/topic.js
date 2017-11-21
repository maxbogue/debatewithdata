import map from 'lodash/map';

import { NotFoundError } from '../api/error';

export default function (sequelize, DataTypes) {
  const Topic = sequelize.define('topic', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
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
    Topic.INCLUDE = function () {
      return {
        include: [{
          association: Topic.Head,
          ...models.TopicRev.INCLUDE(),
        }],
      };
    };

    Topic.apiCreate = async function (user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiCreate(user, data, t);
        });
      }

      const topic = await Topic.create({ id: data.id }, { transaction });
      const blob = await models.Blob.fromText(data.text, transaction);
      const topicRev = await models.TopicRev.create({
        title: data.title,
        userId: user.id,
        topicId: topic.id,
        blobHash: blob.hash,
      }, { transaction });

      await topicRev.addClaims(data.claims, { transaction });
      await topic.setHead(topicRev, { transaction });
      return topicRev;
    };

    Topic.apiUpdate = async function (id, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiUpdate(id, user, data, t);
        });
      }

      const topic = await Topic.findById(id, Topic.INCLUDE());
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }

      const blob = await models.Blob.fromText(data.text, transaction);
      const topicRev = await models.TopicRev.create({
        title: data.title,
        userId: user.id,
        topicId: topic.id,
        parentId: topic.headId,
        blobHash: blob.hash,
      }, { transaction });

      await topicRev.addClaims(data.claims, { transaction });
      await topic.setHead(topicRev, { transaction });
      return topicRev;
    };

    Topic.apiDelete = async function (id, user, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiDelete(id, user, t);
        });
      }

      let topic = await Topic.findById(id, Topic.INCLUDE());
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }

      if (topic.head.deleted) {
        return topic.head;
      }

      let topicRev = await models.TopicRev.create({
        userId: user.id,
        topicId: topic.id,
        parentId: topic.headId,
        deleted: true,
      });
      await topic.setHead(topicRev);
      return topicRev;
    };

    Topic.prototype.fillData = async function (data, user) {
      if (this.head.deleted) {
        data.topics[this.id] = {
          rev: this.headId,
          deleted: true,
        };
        return;
      }

      let thisData = {
        rev: this.headId,
        text: this.head.blob.text,
        title: this.head.title,
        claims: map(this.head.claims, (claim) => claim.id),
        star: await this.toStarData(user),
        commentCount: await this.countComments(),
      };

      for (let claim of this.head.claims) {
        await claim.fillData(data, 1, user);
      }

      data.topics[this.id] = thisData;
    };

    Topic.apiGet = async function (id, user) {
      let topic = await Topic.findById(id, Topic.INCLUDE());
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }
      let data = { topics: {}, claims: {} };
      await topic.fillData(data, user);
      return data;
    };

    Topic.apiGetAll = async function (user) {
      let topics = await Topic.findAll(Topic.INCLUDE());
      let data = { topics: {}, claims: {} };
      for (let topic of topics) {
        if (!topic.head.deleted) {
          await topic.fillData(data, user);
        }
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
