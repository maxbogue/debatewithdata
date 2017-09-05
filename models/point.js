import { genId } from './utils';

const INCLUDE_ALL = { include: { all: true, nested: true } };

export default function (sequelize, DataTypes) {
  const Point = sequelize.define('point', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Point.associate = function (models) {
    Point.belongsTo(models.PointRev, {
      as: 'head',
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Point.hasMany(models.PointRev, {
      as: 'pointRevs',
    });

    Point.makeNew = async function (user, data) {
      let point = await Point.create();
      let blob = await models.Blob.fromText(data.text);
      let rev = await models.PointRev.create({
        blob_hash: blob.hash,
        author_id: user.id,
        point_id: point.id,
      });
      if (data.points) {
        for (let i = 0; i < 2; i++) {
          for (let subpoint of data.points[i]) {
            let subpointRev = await Point.makeNew(user, subpoint);
            let p = rev.addSubpointRev(subpointRev, {
              through: { isFor: i === 0 },
            });
            await p;
          }
        }
      }

      await point.setHead(rev);
      await rev.reload(INCLUDE_ALL);
      return rev;
    };
  };

  return Point;
}
