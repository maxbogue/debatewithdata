import { ClientError } from '../api/error';
import { genRevId, isValidFlag } from './utils';

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
    },
    flag: {
      type: DataTypes.TEXT,
      validate: { isValidFlag },
    },
  });

  PointRev.associate = function (models) {
    PointRev.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
    });
    PointRev.belongsTo(models.Point, {
      foreignKey: {
        name: 'pointId',
        field: 'point_id',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    PointRev.belongsTo(models.Blob, {
      foreignKey: {
        name: 'blobHash',
        field: 'blob_hash',
      },
      onDelete: 'RESTRICT',
    });
    PointRev.belongsTo(models.Claim, {
      foreignKey: {
        name: 'claimId',
        field: 'claim_id',
      },
      onDelete: 'RESTRICT',
    });
    PointRev.belongsTo(models.Source, {
      foreignKey: {
        name: 'sourceId',
        field: 'source_id',
      },
      onDelete: 'RESTRICT',
    });
    PointRev.belongsTo(PointRev, {
      as: 'parent',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id',
      },
      onDelete: 'RESTRICT',
    });
    PointRev.belongsToMany(models.ClaimRev, {
      through: models.ClaimPoint,
      as: 'claimRevs',
    });
    PointRev.SubPointRevs = PointRev.belongsToMany(PointRev, {
      through: models.PointPoint,
      as: 'pointRevs',
      foreignKey: 'point_rev_id',
      otherKey: 'subpoint_rev_id',
    });
    PointRev.SuperPointRevs = PointRev.belongsToMany(PointRev, {
      through: models.PointPoint,
      as: 'superPointRevs',
      foreignKey: 'subpoint_rev_id',
      otherKey: 'point_rev_id',
    });
  };

  PointRev.postAssociate = function (models) {
    PointRev.INCLUDE = function (n, includeUser=false) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      let include = [models.Blob, models.Point, {
        model: models.Claim,
        ...models.Claim.INCLUDE(n),
      }, {
        model: models.Source,
        ...models.Source.INCLUDE(),
      }];
      if (includeUser) {
        include.push(models.User);
      }
      if (n > 1) {
        include.push({
          association: PointRev.SubPointRevs,
          ...models.PointRev.INCLUDE(n - 1, includeUser),
        });
      }
      return { include };
    };

    // Create a new 'claim' point rev, which links to a claim object.
    function createClaimRev(user, point, { claimId }, transaction) {
      if (!claimId) {
        throw new ClientError('Missing attribute: claimId');
      }
      return PointRev.create({
        userId: user.id,
        pointId: point.id,
        parentId: point.headId,
        type: CLAIM,
        claimId: claimId,
      }, { transaction });
    }

    // Create a new 'source' point, which links to a source object.
    function createSourceRev(user, point, { sourceId }, transaction) {
      if (!sourceId) {
        throw new ClientError('Missing attribute: sourceId');
      }
      return PointRev.create({
        userId: user.id,
        pointId: point.id,
        parentId: point.headId,
        type: SOURCE,
        sourceId: sourceId,
      }, { transaction });
    }

    // Adds subpoint revisions corresponding to |pointsData| to the claim or
    // point revision |rev|.
    PointRev.createPoints = async function (user, rev, pointsData,
                                            transaction) {
      for (let i = 0; i < 2; i++) {
        for (let pointData of pointsData[i]) {
          let pointRev;
          if (rev.parentId && pointData.rev) {
            // This is an update operation reusing a point revision.
            pointRev = await PointRev.findById(pointData.rev);
            if (!pointRev) {
              throw new ClientError('Invalid point rev: ' + pointData.rev);
            }
          } else if (rev.parentId && pointData.id) {
            // This is an update operation updating an existing point.
            let point = await models.Point.findById(pointData.id);
            if (!point) {
              throw new ClientError('Invalid point ID: ' + pointData.id);
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
    async function createSubclaimRev(user, point, { text, points, flag },
                                     transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      let pointRev = await PointRev.create({
        userId: user.id,
        pointId: point.id,
        parentId: point.headId,
        type: SUBCLAIM,
        blobHash: blob.hash,
        flag: flag,
      }, { transaction });

      await PointRev.createPoints(user, pointRev, points, transaction);

      return pointRev;
    }

    // Create a new 'text' point.
    async function createTextRev(user, point, { text, flag }, transaction) {
      let blob = await models.Blob.fromText(text, transaction);
      return PointRev.create({
        userId: user.id,
        pointId: point.id,
        parentId: point.headId,
        type: TEXT,
        blobHash: blob.hash,
        flag: flag,
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
        throw new ClientError('Invalid point type: ' + data.type);
      }
    };

    function isFor(pointRev) {
      if (pointRev.claimPoint) {
        return pointRev.claimPoint.isFor;
      }
      return pointRev.pointPoint.isFor;
    }

    /**
     * Returns the API data format for multiple point revisions.
     */
    PointRev.toDatas = async function (pointRevs, data, depth, user) {
      let points = [{}, {}];
      for (let pointRev of pointRevs) {
        let i = isFor(pointRev) ? 0 : 1;
        points[i][pointRev.pointId] = await pointRev.toData(data, depth, user);
      }
      return points;
    };

    /**
     * Returns the API data format for multiple point revisions.
     *
     * @param pointRevs - The PointRev array from the association.
     * @param pointRevDatas - The output map of PointRev data.
     */
    PointRev.toRevDatas = function (pointRevs, pointRevDatas) {
      let points = [{}, {}];
      for (let pointRev of pointRevs) {
        let i = isFor(pointRev) ? 0 : 1;
        points[i][pointRev.pointId] = pointRev.toRevData(pointRevDatas);
      }
      return points;
    };

    /**
     * Returns the API data format for this point.
     *
     * @param data - Linked claims and sources are added to this object as a
     *               side effect.
     * @param depth - The depth to load this point and linked claims to.
     * @param [user] - Used to check whether items are starred.
     */
    PointRev.prototype.toData = async function (data, depth, user) {
      let thisData = {
        rev: this.id,
        type: this.type,
        star: await this.point.toStarData(user),
        commentCount: await this.point.countComments(),
      };
      switch (this.type) {
      case CLAIM:
        thisData.claimId = this.claimId;
        await this.claim.fillData(data, depth, user);
        break;
      case SOURCE:
        thisData.sourceId = this.sourceId;
        data.sources[this.sourceId] = await this.source.toData();
        break;
      case SUBCLAIM:
        if (depth > 1) {
          thisData.points = await PointRev.toDatas(
              this.pointRevs, data, depth - 1, user);
        }
        /* eslint no-fallthrough: "off" */
      case TEXT:
        thisData.text = this.blob.text;
        if (this.flag) {
          thisData.flag = this.flag;
        }
        break;
      default:
        throw new ClientError('Invalid point type: ' + this.type);
      }
      return thisData;
    };

    /**
     * Returns the API data format for this point.
     */
    PointRev.prototype.toRevData = function (pointRevDatas) {
      let thisData = {
        type: this.type,
        username: this.user.username,
        createdAt: this.created_at,
      };
      switch (this.type) {
      case CLAIM:
        if (this.claim.head.deleted) {
          thisData.text = '<deleted>';
        } else {
          thisData.text = this.claim.head.blob.text;
        }
        thisData.claimId = this.claimId;
        break;
      case SOURCE:
        if (this.source.head.deleted) {
          thisData.text = '<deleted>';
        } else {
          thisData.text = this.source.head.blob.text;
          thisData.url = this.source.head.url;
        }
        thisData.sourceId = this.sourceId;
        break;
      case SUBCLAIM:
        if (this.pointRevs) {
          thisData.points = PointRev.toRevDatas(this.pointRevs, pointRevDatas);
        }
        /* eslint no-fallthrough: "off" */
      case TEXT:
        thisData.text = this.blob.text;
        if (this.flag) {
          thisData.flag = this.flag;
        }
        break;
      default:
        throw new ClientError('Invalid point type: ' + this.type);
      }
      pointRevDatas[this.id] = thisData;
      return this.id;
    };
  };

  return PointRev;
}
