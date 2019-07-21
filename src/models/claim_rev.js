import { asyncForOwn } from '@/common/utils';
import { validateClaim } from '@/common/validate';

import { genRevId } from './utils';

export default function(sequelize, DataTypes) {
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
    needsData: {
      field: 'needs_data',
      type: DataTypes.BOOLEAN,
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

  ClaimRev.associate = function(models) {
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

  ClaimRev.postAssociate = function(models) {
    ClaimRev.INCLUDE = function(n, includeUser = false) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      const include = [models.Blob];
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

    ClaimRev.createForApi = async function(claim, user, data, transaction) {
      const blob = await models.Blob.fromText(data.text, transaction);
      const claimRev = await models.ClaimRev.create(
        {
          userId: user.id,
          claimId: claim.id,
          parentId: claim.headId,
          blobHash: blob.hash,
          flag: data.flag,
          needsData: data.needsData,
        },
        { transaction }
      );

      const subClaimIds = data.subClaimIds ? { ...data.subClaimIds } : {};
      const sourceIds = data.sourceIds ? { ...data.sourceIds } : {};

      const promises = [];

      if (data.newSubClaims) {
        for (const claimData of data.newSubClaims) {
          promises.push(
            models.Claim.apiCreate(user, claimData, transaction).then(rev => {
              subClaimIds[rev.claimId] = claimData.isFor;
            })
          );
        }
      }

      if (data.newSources) {
        for (const sourceData of data.newSources) {
          promises.push(
            models.Source.apiCreate(user, sourceData, transaction).then(rev => {
              sourceIds[rev.sourceId] = sourceData.isFor;
            })
          );
        }
      }

      await Promise.all(promises);
      await asyncForOwn(subClaimIds, (isFor, subClaimId) =>
        claimRev.addSubClaim(subClaimId, {
          through: { isFor },
          transaction,
        })
      );
      await asyncForOwn(sourceIds, (isFor, sourceId) =>
        claimRev.addSource(sourceId, {
          through: { isFor },
          transaction,
        })
      );
      await claim.setHead(claimRev, { transaction });
      await claim.addWatchedByUser(user);

      claim.updateGraph(subClaimIds, sourceIds);
      claim.updateIndex({ id: claim.id, text: data.text });

      return claimRev;
    };

    ClaimRev.prototype.getItemId = function() {
      return this.claimId;
    };

    ClaimRev.prototype.toCoreData = function(recurse = true) {
      const data = {
        id: this.claimId,
        revId: this.id,
        updatedAt: this.createdAt,
      };

      if (this.deleted) {
        data.deleted = true;
        data.deleteMessage = this.deleteMessage;
        return data;
      }

      data.text = this.blob.text;
      data.flag = this.flag;
      data.needsData = this.needsData;

      if (recurse) {
        data.subClaimIds = {};
        for (const claim of this.subClaims) {
          data.subClaimIds[claim.id] = claim.claimClaim.isFor;
        }
        data.sourceIds = {};
        for (const source of this.sources) {
          data.sourceIds[source.id] = source.claimSource.isFor;
        }
      }

      return data;
    };

    // Only called for apiGetRevs.
    ClaimRev.prototype.fillData = async function(data) {
      const thisData = this.toCoreData();
      thisData.username = this.user.username;
      thisData.createdAt = this.createdAt;

      if (!thisData.deleted) {
        const promises = [];
        for (const subClaim of this.subClaims) {
          promises.push(subClaim.fillData(data, 1));
        }
        for (const source of this.sources) {
          promises.push(
            source.toData().then(sourceData => {
              data.sources[source.id] = sourceData;
            })
          );
        }
        await Promise.all(promises);
      }

      return thisData;
    };
  };

  return ClaimRev;
}
