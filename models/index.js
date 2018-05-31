import Knex from 'knex';
import Sequelize from 'sequelize';
import config from 'config';
import forOwn from 'lodash/forOwn';

import makeBlob from './blob';
import makeClaim from './claim';
import makeClaimClaim from './claim_claim';
import makeClaimRev from './claim_rev';
import makeClaimSource from './claim_source';
import makeComment from './comment';
import makeInvite from './invite';
import makeSource from './source';
import makeSourceRev from './source_rev';
import makeStar from './star';
import makeTopic from './topic';
import makeTopicClaim from './topic_claim';
import makeTopicRev from './topic_rev';
import makeTopicTopic from './topic_topic';
import makeUser from './user';

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
export const Invite = makeModel('Invite', makeInvite);
export const Source = makeModel('Source', makeSource);
export const SourceRev = makeModel('SourceRev', makeSourceRev);
export const Star = makeModel('Star', makeStar);
export const Topic = makeModel('Topic', makeTopic);
export const TopicClaim = makeModel('TopicClaim', makeTopicClaim);
export const TopicRev = makeModel('TopicRev', makeTopicRev);
export const TopicTopic = makeModel('TopicTopic', makeTopicTopic);
export const User = makeModel('User', makeUser);

forOwn(models, (model) => {
  if ('associate' in model) {
    model.associate(models);
  }
});

forOwn(models, (model) => {
  if ('postAssociate' in model) {
    model.postAssociate(models);
  }
});

async function initGraph() {
  let topics = await Topic.findAll(Topic.INCLUDE(2));
  for (let topic of topics) {
    if (!topic.head.deleted) {
      topic.updateGraph();
      topic.updateIndex();
    }
  }

  let claims = await Claim.findAll(Claim.INCLUDE(2));
  for (let claim of claims) {
    if (!claim.head.deleted) {
      claim.updateGraph();
      claim.updateIndex();
    }
  }

  let sources = await Source.findAll(Source.INCLUDE());
  for (let source of sources) {
    if (!source.head.deleted) {
      source.updateIndex();
    }
  }
}

initGraph().catch((err) => {
  console.error(err.stack);
});
