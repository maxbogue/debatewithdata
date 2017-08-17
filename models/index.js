import config from 'config';
import Sequelize from 'sequelize';
import { forOwn } from 'lodash';

import makeBlob from './blob';
import makeClaim from './claim';
import makeClaimRev from './claim_rev';
import makePoint from './point';
import makePointRev from './point_rev';
import makeSource from './source';
import makeSourceRev from './source_rev';
import makeUser from './user';

const sequelize = new Sequelize(config.get('db'), {
  define: {
    underscored: true,
  },
});

const models = {};

function makeModel(name, makeFn) {
  models[name] = makeFn(sequelize, Sequelize.DataTypes);
  return models[name];
}

makeModel('Blob', makeBlob);
export const Claim = makeModel('Claim', makeClaim);
export const ClaimRev = makeModel('ClaimRev', makeClaimRev);
export const Point = makeModel('Point', makePoint);
export const PointRev = makeModel('PointRev', makePointRev);
export const Source = makeModel('Source', makeSource);
export const SourceRev = makeModel('SourceRev', makeSourceRev);
export const User = makeModel('User', makeUser);

forOwn(models, (model) => {
  if ('associate' in model) {
    model.associate(models);
  }
});

sequelize.sync({force: true});
