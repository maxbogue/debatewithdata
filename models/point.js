import { genId } from './utils';

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
  };

  Point.postAssociate = function (models) {
    // Include directive that gets point text and subpoints with text.
    Point.INCLUDE_SUBPOINTS = {
      include: [
        models.Blob,
        {
          association: models.PointRev.Subpoints,
          include: [models.Blob],
        },
      ],
    };

    // Create a new 'claim' point, which links to a claim object.
    function createClaimRev(revParams, { claimId }, transaction) {
      if (!claimId) {
        throw new Error('Missing claimId.');
      }
      return models.PointRev.create({
        ...revParams,
        claim_id: claimId,
      }, { transaction });
    }

    // Create a new 'source' point, which links to a source object.
    function createSourceRev(revParams, { sourceId }, transaction) {
      if (!sourceId) {
        throw new Error('Missing sourceId.');
      }
      return models.PointRev.create({
        ...revParams,
        source_id: sourceId,
      }, { transaction });
    }

    // Create a new 'subclaim' point, which can have subpoints.
    async function createSubclaimRev(revParams, { text, points }, transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      let pointRev = await models.PointRev.create({
        ...revParams,
        blob_hash: blob.hash,
      }, {
        transaction,
        include: [models.Blob],
      });

      for (let i = 0; i < 2; i++) {
        for (let subpoint of points[i]) {
          let subpointRev;
          if (revParams.prev_rev_id && subpoint.rev) {
            // This is an update operation reusing a point revision.
            subpointRev = await models.PointRev.findById(subpoint.rev);
          } else if (revParams.prev_rev_id && subpoint.id) {
            // This is an update operation updating a subpoint.
            let subpointPoint = await Point.findById(subpoint.id);
            if (!subpointPoint) {
              throw new Error('Bad subpoint ID: ' + subpoint.id);
            }
            subpointRev = await createRev({
              author_id: revParams.author_id,
              point_id: subpoint.id,
              prev_rev_id: subpointPoint.head_id,
            }, subpoint, transaction);
          } else {
            // New subpoint.
            subpointRev = await createPoint({
              author_id: revParams.author_id,
            }, subpoint, transaction);
          }
          await pointRev.addSubpointRev(subpointRev, {
            through: { isFor: i === 0 },
            transaction,
          });
        }
      }
      return pointRev;
    }

    // Create a new 'text' point.
    async function createTextRev(revParams, { text }, transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      return models.PointRev.create({
        ...revParams,
        blob_hash: blob.hash,
      }, { transaction });
    }

    // Dispatches point creation based on type.
    function createRev(revParams, data, transaction) {
      switch (data.type) {
      case 'claim':
        return createClaimRev(revParams, data, transaction);
      case 'source':
        return createSourceRev(revParams, data, transaction);
      case 'subclaim':
        return createSubclaimRev(revParams, data, transaction);
      case 'text':
        return createTextRev(revParams, data, transaction);
      default:
        throw new Error('Bad point type: ' + data.type);
      }
    }

    // revParams must at least include author_id, and point_id will be
    // overwritten if provided.
    async function createPoint(revParams, data, transaction) {
      const point = await Point.create({}, { transaction });
      const pointRev = await createRev({
        ...revParams,
        point_id: point.id,
      }, data, transaction);
      await point.setHead(pointRev, { transaction });
      return pointRev;
    }

    Point.apiCreate = async function (user, data) {
      let pointRev = await sequelize.transaction(function(transaction) {
        return createPoint({ author_id: user.id }, data, transaction);
      });
      await pointRev.reload(Point.INCLUDE_SUBPOINTS);
      return pointRev;
    };

    Point.apiUpdate = async function (pointId, user, data) {
      const point = await Point.findById(pointId);
      if (!point) {
        throw new Error('Point not found for id ' + pointId);
      }
      let pointRev = await sequelize.transaction(async function(transaction) {
        let rev = await createRev({
          author_id: user.id,
          point_id: point.id,
          prev_rev_id: point.head_id,
        }, data, transaction);
        await point.setHead(rev, { transaction });
        return rev;
      });
      await pointRev.reload(Point.INCLUDE_SUBPOINTS);
      return pointRev;
    };
  };

  return Point;
}
