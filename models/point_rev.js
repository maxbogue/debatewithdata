import { genRevId } from './utils';

export default function (sequelize, DataTypes) {
  const PointRev = sequelize.define('point_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
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
      as: 'subpointRevs',
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
        source_id: sourceId,
      }, { transaction });
    }

    // Create a new 'subclaim' point, which can have subpoints.
    async function createSubclaimRev(user, point, { text, points },
                                     transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      let pointRev = await PointRev.create({
        user_id: user.id,
        point_id: point.id,
        parent_id: point.head_id,
        blob_hash: blob.hash,
      }, {
        transaction,
      });

      for (let i = 0; i < 2; i++) {
        for (let subpointData of points[i]) {
          let subpointRev;
          if (point.head_id && subpointData.rev) {
            // This is an update operation reusing a point revision.
            subpointRev = await PointRev.findById(subpointData.rev);
          } else if (point.head_id && subpointData.id) {
            // This is an update operation updating a subpoint.
            let subpoint = await models.Point.findById(subpointData.id);
            if (!subpoint) {
              throw new Error('Bad subpoint ID: ' + subpointData.id);
            }
            subpointRev = await PointRev.apiCreate(
                user, subpoint, subpointData, transaction);
          } else {
            // New subpoint.
            subpointRev = await models.Point.apiCreate(
                user, subpointData, transaction);
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
    async function createTextRev(user, point, { text }, transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      return PointRev.create({
        user_id: user.id,
        point_id: point.id,
        parent_id: point.head_id,
        blob_hash: blob.hash,
      }, { transaction });
    }

    // Dispatches point creation based on type.
    PointRev.apiCreate = function (user, point, data, transaction) {
      switch (data.type) {
      case 'claim':
        return createClaimRev(user, point, data, transaction);
      case 'source':
        return createSourceRev(user, point, data, transaction);
      case 'subclaim':
        return createSubclaimRev(user, point, data, transaction);
      case 'text':
        return createTextRev(user, point, data, transaction);
      default:
        throw new Error('Bad point type: ' + data.type);
      }
    };
  };

  return PointRev;
}
