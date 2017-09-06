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

    async function makeNewInner(user, data, transaction) {
      let point = await Point.create({}, { transaction });
      let blob = await models.Blob.fromText(data.text, transaction);
      let rev = await models.PointRev.create({
        blob_hash: blob.hash,
        author_id: user.id,
        point_id: point.id,
      }, { transaction });
      if (data.points) {
        for (let i = 0; i < 2; i++) {
          for (let subpoint of data.points[i]) {
            let subpointRev = await makeNewInner(user, subpoint, transaction);
            let p = rev.addSubpointRev(subpointRev, {
              through: { isFor: i === 0 },
              transaction,
            });
            await p;
          }
        }
      }

      await point.setHead(rev, { transaction });
      return rev;
    }

    Point.makeNew = async function (user, data) {
      let rev = await sequelize.transaction(function(transaction) {
        return makeNewInner(user, data, transaction);
      });
      await rev.reload(INCLUDE_ALL);
      return rev;
    };
  };

  return Point;
}
