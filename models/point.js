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
      foreignKey: 'starrable_id',
      constraints: false,
    });
    Point.hasMany(models.Comment, {
      foreignKey: 'commentable_id',
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
        throw new Error('Point not found for id ' + pointId);
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
        throw new Error('Point not found.');
      }
      let isStarred = await point.hasStarredByUser(user);
      if (isStarred) {
        await point.removeStarredByUser(user);
      } else {
        await point.addStarredByUser(user);
      }
      return point.toStarData(user);
    };
  };

  return Point;
}
