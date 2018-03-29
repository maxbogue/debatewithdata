import keys from 'lodash/keys';

import graph from '../common/graph';
import { asyncForOwn } from '../common/utils';
import { genRevId } from './utils';
import { validateClaim } from '../common/validate';

export default function (sequelize, DataTypes) {
  const ClaimRev = sequelize.define('claim_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    flag: {
      type: DataTypes.TEXT,
      validate: validateClaim.flag.forDb,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteMessage: {
      field: 'delete_message',
      type: DataTypes.TEXT,
      validate: validateClaim.deleteMessage.forDb,
    },
  });

  ClaimRev.associate = function (models) {
    ClaimRev.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
    });
    ClaimRev.belongsTo(models.Claim, {
      foreignKey: {
        name: 'claimId',
        field: 'claim_id',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    ClaimRev.belongsTo(models.Blob, {
      foreignKey: {
        name: 'blobHash',
        field: 'blob_hash',
      },
      onDelete: 'RESTRICT',
    });
    ClaimRev.belongsTo(models.ClaimRev, {
      as: 'parent',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id',
      },
      onDelete: 'RESTRICT',
    });
    ClaimRev.SubClaims = ClaimRev.belongsToMany(models.Claim, {
      through: models.ClaimClaim,
      as: 'subClaims',
    });
    ClaimRev.Sources = ClaimRev.belongsToMany(models.Source, {
      through: models.ClaimSource,
      as: 'sources',
    });
  };

  ClaimRev.postAssociate = function (models) {
    ClaimRev.INCLUDE = function (n, includeUser=false) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      let include = [models.Blob];
      if (includeUser) {
        include.push(models.User);
      }
      if (n > 1) {
        include.push({
          association: ClaimRev.SubClaims,
          ...models.Claim.INCLUDE(n - 1),
        });
        include.push({
          association: ClaimRev.Sources,
          ...models.Source.INCLUDE(),
        });
      }
      return { include };
    };

    ClaimRev.createForApi = async function (claim, user, data, transaction) {
      const blob = await models.Blob.fromText(data.text, transaction);
      const claimRev = await models.ClaimRev.create({
        userId: user.id,
        claimId: claim.id,
        parentId: claim.headId,
        blobHash: blob.hash,
        flag: data.flag,
      }, { transaction });

      let subClaimIds = data.subClaimIds ? { ...data.subClaimIds } : {};
      let sourceIds = data.sourceIds ? { ...data.sourceIds } : {};

      if (data.newSubClaims) {
        for (let claimData of data.newSubClaims) {
          let rev = await models.Claim.apiCreate(user, claimData, transaction);
          subClaimIds[rev.claimId] = claimData.isFor;
        }
      }
      if (data.newSources) {
        for (let sourceData of data.newSources) {
          let rev = await models.Source.apiCreate(
              user, sourceData, transaction);
          sourceIds[rev.sourceId] = sourceData.isFor;
        }
      }

      await asyncForOwn(subClaimIds, (isFor, subClaimId) =>
        claimRev.addSubClaim(subClaimId, {
          through: { isFor },
          transaction,
        }));
      await asyncForOwn(sourceIds, (isFor, sourceId) =>
        claimRev.addSource(sourceId, {
          through: { isFor },
          transaction,
        }));
      await claim.setHead(claimRev, { transaction });

      let childIds = [...keys(subClaimIds), ...keys(sourceIds)];
      graph.updateChildren(claim.id, childIds);

      return claimRev;
    };

    ClaimRev.prototype.toCoreData = function (recurse=false) {
      let data = {
        id: this.claimId,
        revId: this.id,
      };

      if (this.deleted) {
        data.deleted = true;
        data.deleteMessage = this.deleteMessage;
        return data;
      }

      data.text = this.blob.text;

      if (this.flag) {
        data.flag = this.flag;
      }

      if (recurse) {
        data.subClaimIds = {};
        for (let claim of this.subClaims) {
          data.subClaimIds[claim.id] = claim.claimClaim.isFor;
        }
        data.sourceIds = {};
        for (let source of this.sources) {
          data.sourceIds[source.id] = source.claimSource.isFor;
        }
      }

      return data;
    };

    // Only called for apiGetRevs.
    ClaimRev.prototype.fillData = async function (data) {
      let thisData = this.toCoreData(true);
      thisData.username = this.user.username;
      thisData.createdAt = this.created_at;

      if (!thisData.deleted) {
        for (let subClaim of this.subClaims) {
          await subClaim.fillData(data, 1);
        }
        for (let source of this.sources) {
          data.sources[source.id] = await source.toData();
        }
      }

      data.claimRevs.push(thisData);
    };
  };

  return ClaimRev;
}
