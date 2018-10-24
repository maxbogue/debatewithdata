// Make postgres counts return as integers instead of strings.
import pg from 'pg';
pg.types.setTypeParser(20, 'text', parseInt);

import Knex from 'knex';
import KnexQueryBuilder from 'knex/lib/query/builder';
import Sequelize from 'sequelize';
import _ from 'lodash/fp';
import config from 'config';

import makeBlob from './blob';
import makeClaim from './claim';
import makeClaimClaim from './claim_claim';
import makeClaimRev from './claim_rev';
import makeClaimSource from './claim_source';
import makeComment from './comment';
import makeSource from './source';
import makeSourceRev from './source_rev';
import makeStar from './star';
import makeTopic from './topic';
import makeTopicClaim from './topic_claim';
import makeTopicRev from './topic_rev';
import makeTopicTopic from './topic_topic';
import makeUser from './user';
import makeWatch from './watch';

KnexQueryBuilder.prototype.exists = function(obj) {
  const raw = this.client.raw;
  this.column(
    _.mapValues(
      q => raw(q.select(raw('null')).limit(1)).wrap('exists (', ')'),
      obj
    )
  );
  return this;
};

export const knex = Knex({ client: 'pg', connection: config.get('db') });
export const sequelize = new Sequelize(config.get('db'), {
  define: {
    underscored: true,
    underscoredAll: true,
  },
  logging: null,
  operatorsAliases: false,
});

const models = {};

function makeModel(name, makeFn) {
  models[name] = makeFn(sequelize, Sequelize.DataTypes, knex);
  return models[name];
}

export const Blob = makeModel('Blob', makeBlob);
export const Claim = makeModel('Claim', makeClaim);
export const ClaimClaim = makeModel('ClaimClaim', makeClaimClaim);
export const ClaimRev = makeModel('ClaimRev', makeClaimRev);
export const ClaimSource = makeModel('ClaimSource', makeClaimSource);
export const Comment = makeModel('Comment', makeComment);
export const Source = makeModel('Source', makeSource);
export const SourceRev = makeModel('SourceRev', makeSourceRev);
export const Star = makeModel('Star', makeStar);
export const Topic = makeModel('Topic', makeTopic);
export const TopicClaim = makeModel('TopicClaim', makeTopicClaim);
export const TopicRev = makeModel('TopicRev', makeTopicRev);
export const TopicTopic = makeModel('TopicTopic', makeTopicTopic);
export const User = makeModel('User', makeUser);
export const Watch = makeModel('Watch', makeWatch);

_.forOwn(model => {
  if ('associate' in model) {
    model.associate(models);
  }
}, models);

_.forOwn(model => {
  if ('postAssociate' in model) {
    model.postAssociate(models);
  }
}, models);

async function initGraph() {
  const topics = await Topic.findAll(Topic.INCLUDE(2));
  for (const topic of topics) {
    if (!topic.head.deleted) {
      topic.updateGraph();
      topic.updateIndex();
    }
  }

  const claims = await Claim.findAll(Claim.INCLUDE(2));
  for (const claim of claims) {
    if (!claim.head.deleted) {
      claim.updateGraph();
      claim.updateIndex();
    }
  }

  const sources = await Source.findAll(Source.INCLUDE());
  for (const source of sources) {
    if (!source.head.deleted) {
      source.updateIndex();
    }
  }
}

initGraph().catch(err => {
  console.error(err.stack);
});
