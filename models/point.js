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
    function makeClaimRev(revParams, { claimId }, transaction) {
      if (!claimId) {
        throw new Error('Missing claimId.');
      }
      return models.PointRev.create({
        ...revParams,
        claim_id: claimId,
      }, { transaction });
    }

    // Make a new 'source' point, which links to a source object.
    function makeSourceRev(revParams, { sourceId }, transaction) {
      if (!sourceId) {
        throw new Error('Missing sourceId.');
      }
      return models.PointRev.create({
        ...revParams,
        source_id: sourceId,
      }, { transaction });
    }

    // Make a new 'subclaim' point, which can have subpoints.
    async function makeSubclaimRev(revParams, { text, points }, transaction) {
      let pointRev = await models.PointRev.create({
        ...revParams,
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
          let subpointRev = await makeRev(revParams, subpoint, transaction);
          await pointRev.addSubpointRev(subpointRev, {
            through: { isFor: i === 0 },
            transaction,
          });
        }
      }
      return pointRev;
    }

    // Make a new 'text' point.
    function makeTextRev(revParams, { text }, transaction) {
      return models.PointRev.create({
        ...revParams,
        blob: {
          hash: models.Blob.hashText(text),
          text,
        },
      }, {
        transaction,
        include: [models.Blob],
      });
    }

    // Dispatches point creation based on type.
    function makeRev(revParams, data, transaction) {
      switch (data.type) {
      case 'claim':
        return makeClaimRev(revParams, data, transaction);
      case 'source':
        return makeSourceRev(revParams, data, transaction);
      case 'subclaim':
        return makeSubclaimRev(revParams, data, transaction);
      case 'text':
        return makeTextRev(revParams, data, transaction);
      default:
        throw new Error('Bad point type: ' + data.type);
      }
    }

    Point.apiCreate = async function (user, data) {
      let pointRev = await sequelize.transaction(async function(transaction) {
        let point = await Point.create({}, { transaction });
        let revParams = {
          author_id: user.id,
          point_id: point.id,
        };
        return await makeRev(revParams, data, transaction);
      });
      await pointRev.reload(INCLUDE_ALL);
      return pointRev;
    };
  };

  return Point;
}
