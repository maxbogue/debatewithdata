import Router from 'express-promise-router';
import forEach from 'lodash/forEach';
import map from 'lodash/map';

import { Claim, Invite, sequelize } from '../models';
import { AuthError } from './error';
import { PointType } from '../common/constants';

const router = Router();

router.use(function (req, res, next) {
  if (!req.user || !req.user.admin) {
    throw new AuthError('Must be authenticated as an admin user.');
  }
  next();
});

router.get('/invite', async function (req, res) {
  let invites = await Invite.findAll(Invite.INCLUDE_USER);
  res.json(map(invites, (i) => i.toData()));
});

router.post('/invite', async function (req, res) {
  let invite = await Invite.create({ note: req.body.note });
  res.json(invite.toData());
});

function pointsToNewClaims(points) {
  let count = 0;
  forEach(points, (sidePoints, i) => {
    points[i] = map(sidePoints, (point) => {
      if (point.type === PointType.TEXT) {
        delete point.revId;
        point.type = PointType.NEW_CLAIM;
        point.points = [[], []];
        count += 1;
      } else if (point.type === PointType.SUBCLAIM) {
        delete point.revId;
        point.type = PointType.NEW_CLAIM;
        count += 1 + pointsToNewClaims(point.points);
      }
      return point;
    });
  });
  return count;
}

router.post('/fix/promote-all', async function (req, res) {
  let claims = await Claim.findAll(Claim.INCLUDE(3));
  let data = { claims: {}, sources: {} };
  for (let claim of claims) {
    if (!claim.head.deleted) {
      await claim.fillData(data, 3, null);
    }
  }

  let count = 0;
  await sequelize.transaction(async function(t) {
    for (let claimId in data.claims) {
      if (Object.prototype.hasOwnProperty.call(data.claims, claimId)) {
        let claimData = data.claims[claimId];
        count += pointsToNewClaims(claimData.points);
        await Claim.apiUpdate(claimId, req.user, claimData, t);
      }
    }
  });
  res.json({ count });
});

export default router;
