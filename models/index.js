import Sequelize from 'sequelize';
import config from 'config';
import forOwn from 'lodash/forOwn';

import graph from '../common/graph';
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
  models[name] = makeFn(sequelize, Sequelize.DataTypes);
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
  let getId = (item) => item.id;

  let topics = await Topic.findAll(Topic.INCLUDE(2));
  for (let topic of topics) {
    let subTopicIds = topic.head.subTopics.map(getId);
    let claimIds = topic.head.claims.map(getId);
    graph.updateChildren(topic.id, [...subTopicIds, ...claimIds]);
  }

  let claims = await Claim.findAll(Claim.INCLUDE(2));
  for (let claim of claims) {
    let subClaimIds = claim.head.subClaims.map(getId);
    let sourceIds = claim.head.sources.map(getId);
    graph.updateChildren(claim.id, [...subClaimIds, ...sourceIds]);
  }
}

initGraph().catch((err) => {
  console.error(err.stack);
});
