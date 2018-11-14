import _ from 'lodash/fp';

import graph, { Graph } from '@/common/graph';
import q, { ITEM_FIELDS } from './query';
import search from '@/common/search';
import { ConflictError, NotFoundError } from '@/api/error';
import { ItemType, PAGE_SIZE } from '@/common/constants';
import { ValidationError, validateTopic } from '@/common/validate';
import { topicsAreEqual } from '@/common/equality';

const TOPIC = ItemType.TOPIC;

function notNull(thing) {
  return thing !== null;
}

const hydrateTopics = _.flow(
  _.groupBy('id'),
  _.map(grouped => {
    const topic = _.omit(['subTopicId', 'claimId'], grouped[0]);
    topic.subTopicIds = grouped.map(t => t.subTopicId).filter(notNull);
    topic.claimIds = grouped.map(t => t.claimId).filter(notNull);
    return topic;
  })
);

export default function(sequelize, DataTypes, knex) {
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

  Topic.associate = function(models) {
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
          starrable: TOPIC,
        },
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Topic.belongsToMany(models.User, {
      as: 'watchedByUsers',
      through: {
        model: models.Watch,
        unique: false,
        scope: {
          watchable: TOPIC,
        },
      },
      foreignKey: 'watchableId',
      constraints: false,
    });
    Topic.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: TOPIC,
      },
    });
  };

  Topic.postAssociate = function(models) {
    Topic.INCLUDE = function(n) {
      return {
        include: [
          {
            association: Topic.Head,
            ...models.TopicRev.INCLUDE(n),
          },
        ],
      };
    };

    Topic.apiCreate = async function(user, data, isRoot = false, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiCreate(user, data, isRoot, t);
        });
      }

      validateTopic(data);

      try {
        const topic = await Topic.create(
          {
            id: data.id,
            isRoot,
          },
          { transaction }
        );
        return models.TopicRev.createForApi(topic, user, data, transaction);
      } catch (e) {
        if (e instanceof sequelize.UniqueConstraintError) {
          throw new ValidationError(`"${e.errors[0].path}" must be unique.`);
        }
        throw e;
      }
    };

    Topic.apiUpdate = async function(id, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiUpdate(id, user, data, t);
        });
      }

      const topic = await Topic.findByPk(id, Topic.INCLUDE(2));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }

      validateTopic(data);
      if (!data.baseRev) {
        throw new ValidationError('baseRev', 'required for update operations.');
      }

      if (data.baseRev !== topic.headId) {
        const newData = await Topic.apiGet(id, user);
        throw new ConflictError('Base item changed.', newData);
      }

      if (topicsAreEqual(data, topic.head.toCoreData())) {
        return topic.head;
      }

      return models.TopicRev.createForApi(topic, user, data, transaction);
    };

    Topic.apiDelete = async function(id, user, msg, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Topic.apiDelete(id, user, msg, t);
        });
      }

      const topic = await Topic.findByPk(id, Topic.INCLUDE(3));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }

      if (!msg) {
        throw new ValidationError('deleteMessage', 'must exist.');
      }

      if (topic.head.deleted) {
        return topic.head;
      }

      const topicRev = await models.TopicRev.create({
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

    Topic.prototype.fillData = async function(data, depth, user) {
      if (data.topics[this.id] && data.topics[this.id].depth >= depth) {
        // This topic has already been loaded with at least as much depth.
        return;
      }

      const thisData = this.head.toCoreData();
      thisData.depth = this.head.deleted ? 3 : depth;
      const star = await this.toStarData(user);
      thisData.starCount = star.starCount;
      thisData.starred = star.starred;
      thisData.watched = star.watched;
      thisData.commentCount = await this.countComments();
      thisData.childCount = graph.getCount(this.id);

      const promises = [];

      if (!this.head.deleted && depth > 1) {
        for (const subTopic of this.head.subTopics) {
          promises.push(subTopic.fillData(data, depth - 1, user));
        }
        for (const claim of this.head.claims) {
          promises.push(claim.fillData(data, depth - 1, user));
        }
      }

      if (depth === 3) {
        const superTopics = await models.Topic.findAll({
          include: [
            {
              association: models.Topic.Head,
              required: true,
              include: [
                models.Blob,
                {
                  association: models.TopicRev.SubTopics,
                  where: { id: this.id },
                },
              ],
            },
          ],
        });
        const superTopicIds = [];
        for (const superTopic of superTopics) {
          superTopicIds.push(superTopic.id);
          promises.push(superTopic.fillData(data, 1, user));
        }
        thisData.superTopicIds = superTopicIds;
      }

      await Promise.all(promises);
      data.topics[this.id] = thisData;
    };

    const TOPIC_FIELDS = [...ITEM_FIELDS, 'title', 'text'];

    Topic.innerQuery = (user, modFn = _.identity) =>
      q
        .item(TOPIC, user)
        .column({
          title: 'h.title',
          text: 'b.text',
        })
        .leftOuterJoin(knex.raw('blobs AS b'), 'h.blob_hash', 'b.hash')
        .modify(modFn);

    Topic.wrapQueryWithJoins = query =>
      knex
        .select(TOPIC_FIELDS)
        .from(knex.raw(query).wrap('(', ') AS ignored'))
        .column({
          subTopicId: 'topic_topics.sub_topic_id',
          claimId: 'topic_claims.claim_id',
        })
        .leftOuterJoin('topic_topics', 'revId', 'topic_topics.topic_rev_id')
        .leftOuterJoin('topic_claims', 'revId', 'topic_claims.topic_rev_id');

    Topic.itemQuery = (user, filterFn = _.identity, sortFn = _.identity) =>
      Topic.wrapQueryWithJoins(
        Topic.innerQuery(
          user,
          _.flow(
            filterFn,
            sortFn
          )
        )
      ).modify(sortFn);

    Topic.processQueryResults = _.flow(
      hydrateTopics,
      _.forEach(topic => {
        topic.depth = 1;
        topic.childCount = graph.getCount(topic.id);
      })
    );

    Topic.apiGet = async function(id, user) {
      const topic = await Topic.findByPk(id, Topic.INCLUDE(3));
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }
      const data = { topics: {}, claims: {}, sources: {} };
      await topic.fillData(data, 3, user);
      return data;
    };

    Topic.apiSetIsRoot = async function(id, isRoot) {
      const topic = await Topic.findByPk(id);
      await topic.update({ isRoot });
    };

    Topic.apiGetAll = async function({ user, filters, sort, page } = {}) {
      page = page || 1;

      const filterFn = query =>
        query
          .where({
            is_root: true,
            deleted: false,
          })
          .modify(q.filter, filters)
          .offset(PAGE_SIZE * (page - 1))
          .limit(PAGE_SIZE);
      const sortFn = query => query.modify(q.sort, sort);

      const query = Topic.itemQuery(user, filterFn, sortFn);
      const countQuery = Topic.innerQuery(user)
        .where({
          is_root: true,
          deleted: false,
        })
        .modify(q.filter, filters)
        .modify(q.count);

      const [flatTopics, [{ count }]] = await Promise.all([query, countQuery]);
      const topics = Topic.processQueryResults(flatTopics);

      return {
        topics: _.keyBy('id', topics),
        results: topics.map(topic => topic.id),
        numPages: Math.ceil(count / PAGE_SIZE),
      };
    };

    Topic.apiGetForTrail = async function(ids, user) {
      const filterFn = query => query.whereIn('i.id', ids);
      const flatTopics = await Topic.itemQuery(user, filterFn);
      const topics = Topic.processQueryResults(flatTopics);
      return {
        topics: _.keyBy('id', topics),
      };
    };

    Topic.apiGetRevs = async function(topicId, user) {
      const topicRevs = await models.TopicRev.findAll({
        where: { topicId },
        order: [['created_at', 'DESC']],
        ...models.TopicRev.INCLUDE(2, true),
      });

      if (topicRevs.length === 0) {
        throw new NotFoundError('Topic not found: ' + topicId);
      }

      const data = {
        topicRevs: [],
        topics: {},
        claims: {},
      };
      data.topicRevs = await Promise.all(
        topicRevs.map(topicRev => topicRev.fillData(data, user))
      );
      return data;
    };

    Topic.prototype.toStarData = async function(user) {
      const starCount = await this.countStarredByUsers();
      let starred = false;
      let watched = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
        watched = await this.hasWatchedByUser(user);
      }
      return { starCount, starred, watched };
    };

    Topic.apiToggleStar = async function(id, user) {
      const topic = await Topic.findByPk(id);
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + id);
      }
      const isStarred = await topic.hasStarredByUser(user);
      if (isStarred) {
        await topic.removeStarredByUser(user);
      } else {
        await topic.addStarredByUser(user);
        await topic.addWatchedByUser(user);
      }
      return await topic.toStarData(user);
    };

    Topic.apiToggleWatch = async function(topicId, user) {
      const topic = await Topic.findByPk(topicId);
      if (!topic) {
        throw new NotFoundError('Topic not found: ' + topicId);
      }
      const isWatched = await topic.hasWatchedByUser(user);
      if (isWatched) {
        await topic.removeWatchedByUser(user);
      } else {
        await topic.addWatchedByUser(user);
      }
      return { watched: !isWatched };
    };

    Topic.prototype.updateGraph = function(subTopics, claims) {
      subTopics = subTopics || this.head.subTopics;
      claims = claims || this.head.claims;
      const topicInfos = subTopics.map(Graph.toTopicInfo);
      const claimInfos = claims.map(Graph.toClaimInfo);
      graph.updateTopicChildren(this.id, [...topicInfos, ...claimInfos]);
    };

    Topic.prototype.updateIndex = function(data) {
      data = data || this.head.toCoreData();
      search.updateTopic(data);
    };
  };

  return Topic;
}
