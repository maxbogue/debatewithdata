import { genId } from './utils';

export default function (sequelize, DataTypes) {
  const Point = sequelize.define('point', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Point.associate = function (models) {
    Point.Head = Point.belongsTo(models.PointRev, {
      as: 'head',
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Point.hasMany(models.PointRev, {
      as: 'pointRevs',
    });
  };

  Point.postAssociate = function (models) {
    // Include directive that gets point text and subpoints with text.
    Point.INCLUDE_SUBPOINTS = {
      include: [
        models.Blob,
        {
          association: models.PointRev.Subpoints,
          include: [models.Blob],
        },
      ],
    };

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
  };

  return Point;
}
