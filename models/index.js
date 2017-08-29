import config from 'config';
import Sequelize from 'sequelize';
import { forOwn } from 'lodash';

import makeBlob from './blob';
import makeClaim from './claim';
import makeClaimPoint from './claim_point';
import makeClaimRev from './claim_rev';
import makePoint from './point';
import makePointPoint from './point_point';
import makePointRev from './point_rev';
import makeSource from './source';
import makeSourceRev from './source_rev';
import makeUser from './user';

export const sequelize = new Sequelize(config.get('db'), {
  define: {
    underscored: true,
  },
  logging: null,
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
export const Point = makeModel('Point', makePoint);
export const PointPoint = makeModel('PointPoint', makePointPoint);
export const PointRev = makeModel('PointRev', makePointRev);
export const Source = makeModel('Source', makeSource);
export const SourceRev = makeModel('SourceRev', makeSourceRev);
export const User = makeModel('User', makeUser);

forOwn(models, (model) => {
  if ('associate' in model) {
    model.associate(models);
  }
});
