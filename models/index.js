import Sequelize from 'sequelize';
import config from 'config';
import forOwn from 'lodash/forOwn';

import makeBlob from './blob';
import makeClaim from './claim';
import makeClaimPoint from './claim_point';
import makeClaimRev from './claim_rev';
import makeComment from './comment';
import makeInvite from './invite';
import makePoint from './point';
import makePointPoint from './point_point';
import makePointRev from './point_rev';
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
export const ClaimPoint = makeModel('ClaimPoint', makeClaimPoint);
export const ClaimRev = makeModel('ClaimRev', makeClaimRev);
export const Comment = makeModel('Comment', makeComment);
export const Invite = makeModel('Invite', makeInvite);
export const Point = makeModel('Point', makePoint);
export const PointPoint = makeModel('PointPoint', makePointPoint);
export const PointRev = makeModel('PointRev', makePointRev);
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
