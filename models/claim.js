import { genId } from './utils';

export default function (sequelize, DataTypes) {
  const Claim = sequelize.define('claim', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Claim.associate = function (models) {
    Claim.Head = Claim.belongsTo(models.ClaimRev, {
      as: 'head',
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Claim.hasMany(models.ClaimRev);
  };

  Claim.postAssociate = function (models) {
    Claim.INCLUDE_TEXT = {
      include: [models.Blob],
    };

    Claim.INCLUDE_POINTS = {
      include: [models.Blob, {
        association: models.ClaimRev.Points,
        include: [models.Blob, {
          association: models.PointRev.Subpoints,
          include: [models.Blob],
        }],
      }],
    };

    Claim.INCLUDE_HEAD = {
      include: [{
        association: Claim.Head,
        include: [models.Blob],
      }],
    };

    Claim.INCLUDE_HEAD_POINTS = {
      include: [{
        association: Claim.Head,
        ...Claim.INCLUDE_POINTS,
      }],
    };

    Claim.apiCreate = async function (user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiCreate(user, data, t);
        });
      }

      const claim = await Claim.create({}, { transaction });
      const blob = await models.Blob.fromText(data.text, transaction);
      const claimRev = await models.ClaimRev.create({
        user_id: user.id,
        claim_id: claim.id,
        blob_hash: blob.hash,
      }, { transaction });
      await claim.setHead(claimRev, { transaction });

      if (data.points) {
        await models.PointRev.createPoints(
            user, claimRev, data.points, transaction);
      }

      return claimRev;
    };

    Claim.apiUpdate = async function (claimId, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiUpdate(claimId, user, data, t);
        });
      }

      const claim = await Claim.findById(claimId, Claim.INCLUDE_HEAD);
      if (!claim) {
        throw new Error('No claim found for ID: ' + claimId);
      }

      const blob = await models.Blob.fromText(data.text, transaction);
      const claimRev = await models.ClaimRev.create({
        user_id: user.id,
        claim_id: claim.id,
        parent_id: claim.head_id,
        blob_hash: blob.hash,
      }, { transaction });
      await claim.setHead(claimRev, { transaction });

      if (data.points) {
        await models.PointRev.createPoints(
            user, claimRev, data.points, transaction);
      }

      return claimRev;
    };

    Claim.apiDelete = async function (claimId, user) {
      let claim = await Claim.findById(claimId, Claim.INCLUDE_HEAD);
      if (!claim) {
        throw new Error('No claim found for ID: ' + claimId);
      }

      if (claim.head.deleted) {
        return claim.head;
      }

      let claimRev = await models.ClaimRev.create({
        user_id: user.id,
        claim_id: claim.id,
        parent_id: claim.head_id,
        deleted: true,
      });
      await claim.setHead(claimRev);
      return claimRev;
    };

    Claim.prototype.toData = function () {
      if (this.head.deleted) {
        return {
          rev: this.head_id,
          deleted: true,
        };
      }

      return {
        rev: this.head_id,
        text: this.head.blob.text,
        points: models.PointRev.toDatas(this.head.pointRevs),
      };
    };

    Claim.apiGet = async function (claimId) {
      let claim = await Claim.findById(claimId, Claim.INCLUDE_HEAD_POINTS);
      if (!claim) {
        throw Error('Claim ID not found: ' + claimId);
      }
      return claim.toData();
    };

    Claim.apiGetAll = async function () {
      let claims = await Claim.findAll(Claim.INCLUDE_HEAD_POINTS);
      let ret = {};
      for (let claim of claims) {
        if (!claim.head.deleted) {
          ret[claim.id] = claim.toData();
        }
      }
      return ret;
    };
  };

  return Claim;
}
