import graph, { Graph } from '../common/graph';
import search from '../common/search';
import { ConflictError, NotFoundError } from '../api/error';
import { PAGE_SIZE, ItemType } from '../common/constants';
import { ValidationError, validateTopic } from '../common/validate';
import { sortAndFilterQuery } from './utils';
import { topicsAreEqual } from '../common/equality';

export default function (sequelize, DataTypes, knex) {
  const Topic = sequelize.define('topic', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      validate: validateTopic.id.forDb,
    },
    isRoot: {
      field: 'is_root',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
          starrable: ItemType.TOPIC,
        }
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Topic.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: ItemType.TOPIC,
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

    Topic.apiCreate = async function (user, data, isRoot=false, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiCreate(user, data, isRoot, t);
        });
      }

      validateTopic(data);

      try {
        const topic = await Topic.create({
          id: data.id,
          isRoot,
        }, { transaction });
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

      const topic = await Topic.findById(id, Topic.INCLUDE(2));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }

      validateTopic(data);
      if (!data.baseRev) {
        throw new ValidationError('baseRev', 'required for update operations.');
      }

      if (data.baseRev !== topic.headId) {
        let newData = await Topic.apiGet(id, user);
        throw new ConflictError('Base item changed.', newData);
      }

      if (topicsAreEqual(data, topic.head.toCoreData())) {
        return topic.head;
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

      graph.updateTopicChildren(topic.id, []);

      return topicRev;
    };

    Topic.prototype.fillData = async function (data, depth, user) {
      if (data.topics[this.id] && data.topics[this.id].depth >= depth) {
        // This topic has already been loaded with at least as much depth.
        return;
      }

      let thisData = this.head.toCoreData();
      thisData.depth = this.head.deleted ? 3 : depth;
      let star = await this.toStarData(user);
      thisData.starCount = star.starCount;
      thisData.starred = star.starred;
      thisData.commentCount = await this.countComments();
      thisData.childCount = graph.getCount(this.id);

      if (!this.head.deleted && depth > 1) {
        for (let subTopic of this.head.subTopics) {
          await subTopic.fillData(data, depth - 1, user);
        }
        for (let claim of this.head.claims) {
          await claim.fillData(data, depth - 1, user);
        }
      }

      if (depth === 3) {
        let superTopics = await models.Topic.findAll({
          include: [{
            association: models.Topic.Head,
            required: true,
            include: [models.Blob, {
              association: models.TopicRev.SubTopics,
              where: { id: this.id },
            }],
          }],
        });
        let superTopicIds = [];
        for (let superTopic of superTopics) {
          superTopicIds.push(superTopic.id);
          await superTopic.fillData(data, 1, user);
        }
        thisData.superTopicIds = superTopicIds;
      }

      data.topics[this.id] = thisData;
    };

    Topic.apiGet = async function (id, user) {
      let topic = await Topic.findById(id, Topic.INCLUDE(3));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }
      let data = { topics: {}, claims: {}, sources: {} };
      await topic.fillData(data, 3, user);
      return data;
    };

    Topic.apiSetIsRoot = async function (id, isRoot) {
      let topic = await Topic.findById(id);
      await topic.update({ isRoot });
    };

    Topic.apiGetRoots = async function ({ user, filters, sort, page } = {}) {
      page = page || 1;
      // Join table query to extract starCount.
      let starQuery = knex('topics')
        .column({
          id: 'topics.id',
          starred: knex.raw(
              knex('stars')
                .select(knex.raw('null'))
                .where({
                  'stars.user_id': user ? user.id : null,
                  'stars.starrable_id': knex.raw('??', ['topics.id']),
                  'stars.starrable': knex.raw('?', ['topic']),
                })
                .limit(1)
          ).wrap('exists (', ')'),
        })
        .count({ count: 'stars.id' })
        .leftOuterJoin('stars', function () {
          this.on('topics.id', 'stars.starrable_id')
            .andOn('stars.starrable', knex.raw('?', ['topic']));
        })
        .groupBy('topics.id');

      // Join table query to extract commentCount.
      let commentQuery = knex('topics')
        .column({ id: 'topics.id' })
        .count({ count: 'comments.id' })
        .leftOuterJoin('comments', function () {
          /* eslint no-invalid-this: "off" */
          this.on('topics.id', 'comments.commentable_id')
            .andOn('comments.commentable', knex.raw('?', ['topic']));
        })
        .groupBy('topics.id');

      let query = knex(knex.raw('topics AS i'))
        .column({
          id: 'i.id',
          revId: 'h.id',
          title: 'h.title',
          text: 'b.text',
          commentCount: 'm.count',
          starCount: 's.count',
          starred: 's.starred',
        })
        .select()
        .where({
          is_root: true,
          deleted: false,
        })
        .leftOuterJoin(knex.raw('topic_revs AS h'), 'i.head_id', 'h.id')
        .leftOuterJoin(knex.raw('blobs AS b'), 'h.blob_hash', 'b.hash')
        .leftOuterJoin(starQuery.as('s'), 'i.id', 's.id')
        .leftOuterJoin(commentQuery.as('m'), 'i.id', 'm.id');

      sortAndFilterQuery(query, sort, filters);
      let countQuery = query.clone().clearSelect().clearOrder().count('*');
      query.offset(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE);

      let [topics, [{ count }]] = await Promise.all([query, countQuery]);
      let data = { topics: {} };
      for (let topic of topics) {
        topic.depth = 1;
        topic.childCount = graph.getCount(topic.id);
        data.topics[topic.id] = topic;
      }
      data.results = topics.map((topic) => topic.id);
      data.numPages = Math.ceil(count / PAGE_SIZE);
      return data;
    };

    Topic.apiGetAll = async function (user, topicIds) {
      let query = {};
      let depth = 2;
      if (topicIds) {
        query.where = { id: topicIds };
        depth = 3;
      }
      let topics = await Topic.findAll({
        ...query,
        ...Topic.INCLUDE(depth),
      });
      let data = { topics: {}, claims: {}, sources: {} };
      for (let topic of topics) {
        if (!topic.head.deleted) {
          await topic.fillData(data, depth, user);
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
      let starCount = await this.countStarredByUsers();
      let starred = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
      }
      return { starCount, starred };
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

    Topic.prototype.updateGraph = function (subTopics, claims) {
      subTopics = subTopics || this.head.subTopics;
      claims = claims || this.head.claims;
      let topicInfos = subTopics.map(Graph.toTopicInfo);
      let claimInfos = claims.map(Graph.toClaimInfo);
      graph.updateTopicChildren(this.id, [...topicInfos, ...claimInfos]);
    };

    Topic.prototype.updateIndex = function (data) {
      data = data || this.head.toCoreData();
      search.updateTopic(data);
    };
  };

  return Topic;
}
