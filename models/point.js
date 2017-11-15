import { NotFoundError } from '../api/error';
import { genId } from './utils';

export default function (sequelize, DataTypes) {
  const Point = sequelize.define('point', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Point.CLAIM = 'claim';
  Point.SOURCE = 'source';
  Point.SUBCLAIM = 'subclaim';
  Point.TEXT = 'text';

  Point.associate = function (models) {
    Point.Head = Point.belongsTo(models.PointRev, {
      as: 'head',
      foreignKey: {
        name: 'headId',
        field: 'head_id',
      },
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Point.hasMany(models.PointRev, {
      as: 'pointRevs',
    });
    Point.belongsToMany(models.User, {
      as: 'starredByUsers',
      through: {
        model: models.Star,
        unique: false,
        scope: {
          starrable: 'point',
        }
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Point.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: 'point',
      },
    });
  };

  Point.postAssociate = function (models) {
    Point.apiCreate = async function (user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Point.apiCreate(user, data, t);
        });
      }
      const point = await Point.create({}, { transaction });
      const pointRev = await models.PointRev.apiCreate(
          user, point, data, transaction);
      await point.setHead(pointRev, { transaction });
      return pointRev;
    };

    Point.apiUpdate = async function (pointId, user, data) {
      const point = await Point.findById(pointId);
      if (!point) {
        throw new NotFoundError('Point not found: ' + pointId);
      }
      let pointRev = await sequelize.transaction(async function(transaction) {
        let rev = await models.PointRev.apiCreate(
            user, point, data, transaction);
        await point.setHead(rev, { transaction });
        return rev;
      });
      return pointRev;
    };

    Point.prototype.toStarData = async function (user) {
      let count = await this.countStarredByUsers();
      let starred = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
      }
      return { count, starred };
    };

    Point.apiToggleStar = async function (pointId, user) {
      let point = await Point.findById(pointId);
      if (!point) {
        throw new NotFoundError('Point not found: ' + pointId);
      }
      let isStarred = await point.hasStarredByUser(user);
      if (isStarred) {
        await point.removeStarredByUser(user);
      } else {
        await point.addStarredByUser(user);
      }
      return point.toStarData(user);
    };

    Point.getClaimId = async function (pointId) {
      let point = await Point.findById(pointId, {
        include: {
          association: Point.Head,
        },
      });
      let claimRevs = await point.head.getClaimRevs({ limit: 1 });
      if (claimRevs.length === 0) {
        let pointRevs = await point.head.getSuperPointRevs({ limit: 1 });
        if (pointRevs.length === 0) {
          throw new NotFoundError('No super point found for ' + pointId);
        }
        claimRevs = await pointRevs[0].getClaimRevs({ limit: 1 });
      }
      if (claimRevs.length === 0) {
        throw new NotFoundError('No claim found for ' + pointId);
      }
      return claimRevs[0].claimId;
    };
  };

  return Point;
}
