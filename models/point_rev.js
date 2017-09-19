import { genRevId } from './utils';

const CLAIM = 'claim';
const SOURCE = 'source';
const SUBCLAIM = 'subclaim';
const TEXT = 'text';

const VALID_POINT_TYPES = [
  CLAIM,
  SOURCE,
  SUBCLAIM,
  TEXT,
];

export default function (sequelize, DataTypes) {
  const PointRev = sequelize.define('point_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isIn: [VALID_POINT_TYPES],
      },
    }
  });

  PointRev.associate = function (models) {
    PointRev.belongsTo(models.User);
    PointRev.belongsTo(models.Point);
    PointRev.belongsTo(models.Blob);
    PointRev.belongsTo(models.Claim);
    PointRev.belongsTo(models.Source);
    PointRev.belongsTo(PointRev, {
      as: 'parent',
    });
    PointRev.belongsToMany(models.ClaimRev, {
      through: models.ClaimPoint,
      as: 'claimRevs',
    });
    PointRev.Subpoints = PointRev.belongsToMany(PointRev, {
      through: models.PointPoint,
      as: 'pointRevs',
      otherKey: 'subpoint_rev_id',
    });
  };

  PointRev.postAssociate = function (models) {
    // Create a new 'claim' point rev, which links to a claim object.
    function createClaimRev(user, point, { claimId }, transaction) {
      if (!claimId) {
        throw new Error('Missing claimId.');
      }
      return PointRev.create({
        user_id: user.id,
        point_id: point.id,
        parent_id: point.head_id,
        type: CLAIM,
        claim_id: claimId,
      }, { transaction });
    }

    // Create a new 'source' point, which links to a source object.
    function createSourceRev(user, point, { sourceId }, transaction) {
      if (!sourceId) {
        throw new Error('Missing sourceId.');
      }
      return PointRev.create({
        user_id: user.id,
        point_id: point.id,
        parent_id: point.head_id,
        type: SOURCE,
        source_id: sourceId,
      }, { transaction });
    }

    // Adds subpoint revisions corresponding to |pointsData| to the claim or
    // point revision |rev|.
    PointRev.createPoints = async function (user, rev, pointsData,
                                            transaction) {
      for (let i = 0; i < 2; i++) {
        for (let pointData of pointsData[i]) {
          let pointRev;
          if (rev.parent_id && pointData.rev) {
            // This is an update operation reusing a point revision.
            pointRev = await PointRev.findById(pointData.rev);
            if (!pointRev) {
              throw new Error('Bad point rev ID: ' + pointData.rev);
            }
          } else if (rev.parent_id && pointData.id) {
            // This is an update operation updating an existing point.
            let point = await models.Point.findById(pointData.id);
            if (!point) {
              throw new Error('Bad point ID: ' + pointData.id);
            }
            pointRev = await PointRev.apiCreate(
                user, point, pointData, transaction);
          } else {
            // New point.
            pointRev = await models.Point.apiCreate(
                user, pointData, transaction);
          }
          await rev.addPointRev(pointRev, {
            through: { isFor: i === 0 },
            transaction,
          });
        }
      }
    };

    // Create a new 'subclaim' point, which can have subpoints.
    async function createSubclaimRev(user, point, { text, points },
                                     transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      let pointRev = await PointRev.create({
        user_id: user.id,
        point_id: point.id,
        parent_id: point.head_id,
        type: SUBCLAIM,
        blob_hash: blob.hash,
      }, { transaction });

      await PointRev.createPoints(user, pointRev, points, transaction);

      return pointRev;
    }

    // Create a new 'text' point.
    async function createTextRev(user, point, { text }, transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      return PointRev.create({
        user_id: user.id,
        point_id: point.id,
        parent_id: point.head_id,
        type: TEXT,
        blob_hash: blob.hash,
      }, { transaction });
    }

    // Dispatches point creation based on type.
    PointRev.apiCreate = function (user, point, data, transaction) {
      switch (data.type) {
      case CLAIM:
        return createClaimRev(user, point, data, transaction);
      case SOURCE:
        return createSourceRev(user, point, data, transaction);
      case SUBCLAIM:
        return createSubclaimRev(user, point, data, transaction);
      case TEXT:
        return createTextRev(user, point, data, transaction);
      default:
        throw new Error('Bad point type: ' + data.type);
      }
    };
  };

  return PointRev;
}
