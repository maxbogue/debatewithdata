import assign from 'lodash/assign';
import map from 'lodash/map';

import { NotFoundError } from '../api/error';
import { genId } from './utils';
import { PointType } from '../common/constants';
import { validatePoint } from '../common/validate';

export default function (sequelize, DataTypes) {
  const Point = sequelize.define('point', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  assign(Point, PointType);

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

      validatePoint(data);

      const point = await Point.create({}, { transaction });
      const pointRev = await models.PointRev.apiCreate(
          user, point, data, transaction);
      await point.setHead(pointRev, { transaction });
      return pointRev;
    };

    Point.apiUpdate = async function (pointId, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Point.apiUpdate(pointId, user, data, t);
        });
      }

      validatePoint(data);

      const point = await Point.findById(pointId);
      if (!point) {
        throw new NotFoundError('Point not found: ' + pointId);
      }

      let pointRev = await models.PointRev.apiCreate(
          user, point, data, transaction);
      await point.setHead(pointRev, { transaction });
      return pointRev;
    };

    Point.apiGetRevs = async function (pointId) {
      let pointRevs = await models.PointRev.findAll({
        where: { pointId },
        order: [['created_at', 'DESC']],
        ...models.PointRev.INCLUDE(2, true),
      });

      if (pointRevs.length === 0) {
        throw new NotFoundError('Point not found: ' + pointId);
      }

      let pointRevData = {};
      let pointRevIds = map(pointRevs, (rev) => rev.toRevData(pointRevData));
      return {
        isFor: await Point.getIsFor(pointId),
        pointRevIds: pointRevIds,
        pointRevs: pointRevData,
      };
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

    Point.getIsFor = async function (pointId) {
      let point = await Point.findById(pointId, {
        include: {
          association: Point.Head,
        },
      });
      let claimRevs = await point.head.getClaimRevs({ limit: 1 });
      if (claimRevs.length > 0) {
        return claimRevs[0].claimPoint.isFor;
      }
      let pointRevs = await point.head.getSuperPointRevs({ limit: 1 });
      if (pointRevs.length > 0) {
        return pointRevs[0].pointPoint.isFor;
      }
      throw new NotFoundError('No parent found for ' + pointId);
    };
  };

  return Point;
}
