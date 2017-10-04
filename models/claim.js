import { NotFoundError } from '../api/error';
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
    Claim.hasMany(models.ClaimRev, {
      as: 'claimRevs',
    });
    Claim.belongsToMany(models.User, {
      as: 'starredByUsers',
      through: {
        model: models.Star,
        unique: false,
        scope: {
          starrable: 'claim',
        }
      },
      foreignKey: 'starrable_id',
      constraints: false,
    });
    Claim.hasMany(models.Comment, {
      foreignKey: 'commentable_id',
      constraints: false,
      scope: {
        commentable: 'claim',
      },
    });
  };

  Claim.postAssociate = function (models) {
    Claim.INCLUDE = function (n) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      return {
        include: [{
          association: Claim.Head,
          ...models.ClaimRev.INCLUDE(n),
        }],
      };
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

      const claim = await Claim.findById(claimId, Claim.INCLUDE(1));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
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

    Claim.apiDelete = async function (claimId, user, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiDelete(claimId, user, t);
        });
      }

      let claim = await Claim.findById(claimId, Claim.INCLUDE(1));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
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

    Claim.prototype.fillData = async function (data, depth, user) {
      if (this.head.deleted) {
        data.claims[this.id] = {
          rev: this.head_id,
          depth: 3,
          deleted: true,
        };
        return;
      }

      if (data.claims[this.id] && data.claims[this.id].depth >= depth) {
        // This claim has already been loaded with at least as much depth.
        return;
      }

      let thisData = {
        rev: this.head_id,
        text: this.head.blob.text,
        depth: depth,
        star: await this.toStarData(user),
      };

      if (depth > 1) {
        thisData.points = await models.PointRev.toDatas(
            this.head.pointRevs, data, depth - 1, user);
      }

      data.claims[this.id] = thisData;
    };

    Claim.apiGet = async function (claimId, user) {
      let claim = await Claim.findById(claimId, Claim.INCLUDE(3));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }
      let data = { claims: {}, sources: {} };
      await claim.fillData(data, 3, user);
      return data;
    };

    Claim.apiGetAll = async function (user) {
      let claims = await Claim.findAll(Claim.INCLUDE(3));
      let data = { claims: {}, sources: {} };
      for (let claim of claims) {
        if (!claim.head.deleted) {
          await claim.fillData(data, 3, user);
        }
      }
      return data;
    };

    Claim.prototype.toStarData = async function (user) {
      let count = await this.countStarredByUsers();
      let starred = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
      }
      return { count, starred };
    };

    Claim.apiToggleStar = async function (claimId, user) {
      let claim = await Claim.findById(claimId);
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }
      let isStarred = await claim.hasStarredByUser(user);
      if (isStarred) {
        await claim.removeStarredByUser(user);
      } else {
        await claim.addStarredByUser(user);
      }
      return await claim.toStarData(user);
    };
  };

  return Claim;
}
