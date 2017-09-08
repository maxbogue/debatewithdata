import { genId } from './utils';

const INCLUDE_ALL = { include: { all: true, nested: true } };

export default function (sequelize, DataTypes) {
  const Point = sequelize.define('point', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Point.associate = function (models) {
    Point.Head = Point.belongsTo(models.PointRev, {
      as: 'head',
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Point.hasMany(models.PointRev, {
      as: 'pointRevs',
    });

    // Make a new 'claim' point, which links to a claim object.
    async function makeNewClaimLink(user, { claimId }, transaction) {
      if (!claimId) {
        throw new Error('Missing claimId.');
      }
      let point = await Point.create({}, { transaction });
      return await models.PointRev.create({
        author_id: user.id,
        point_id: point.id,
        claim_id: claimId,
      }, { transaction });
    }

    // Make a new 'source' point, which links to a source object.
    async function makeNewSourceLink(user, { sourceId }, transaction) {
      if (!sourceId) {
        throw new Error('Missing sourceId.');
      }
      let point = await Point.create({}, { transaction });
      return await models.PointRev.create({
        author_id: user.id,
        point_id: point.id,
        source_id: sourceId,
      }, { transaction });
    }

    // Make a new 'subclaim' point, which can have subpoints.
    async function makeNewSubclaim(user, { text, points }, transaction) {
      let point = await Point.create({}, { transaction });
      let pointRev = await models.PointRev.create({
        author_id: user.id,
        point_id: point.id,
        blob: {
          hash: models.Blob.hashText(text),
          text,
        },
      }, {
        transaction,
        include: [models.Blob],
      });

      for (let i = 0; i < 2; i++) {
        for (let subpoint of points[i]) {
          let subpointRev = await makeNewInner(user, subpoint, transaction);
          await pointRev.addSubpointRev(subpointRev, {
            through: { isFor: i === 0 },
            transaction,
          });
        }
      }
      return pointRev;
    }

    // Make a new 'text' point.
    async function makeNewText(user, { text }, transaction) {
      let point = await Point.create({}, { transaction });
      let pointRev = await models.PointRev.create({
        author_id: user.id,
        point_id: point.id,
        blob: {
          hash: models.Blob.hashText(text),
          text,
        },
      }, {
        transaction,
        include: [models.Blob],
      });
      return pointRev;
    }

    // Dispatches point creation based on type.
    function makeNewInner(user, data, transaction) {
      switch (data.type) {
      case 'claim':
        return makeNewClaimLink(user, data, transaction);
      case 'source':
        return makeNewSourceLink(user, data, transaction);
      case 'subclaim':
        return makeNewSubclaim(user, data, transaction);
      case 'text':
        return makeNewText(user, data, transaction);
      default:
        throw new Error('Bad point type: ' + data.type);
      }
    }

    Point.makeNew = async function (user, data) {
      let pointRev = await sequelize.transaction(function(transaction) {
        return makeNewInner(user, data, transaction);
      });
      await pointRev.reload(INCLUDE_ALL);
      return pointRev;
    };
  };

  return Point;
}
