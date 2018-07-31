export default function (sequelize, DataTypes) {
  const Watch = sequelize.define('watch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    watchable: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: 'watch_watchable',
    },
    watchableId: {
      field: 'watchable_id',
      type: DataTypes.TEXT,
      allowNull: false,
      unique: 'watch_watchable',
      references: null,
    },
  });

  Watch.associate = function (models) {
    Watch.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
        unique: 'watch_watchable',
      },
      onDelete: 'CASCADE',
    });
  };

  return Watch;
}
