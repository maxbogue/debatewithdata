export default function (sequelize, DataTypes) {
  const Star = sequelize.define('star', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    starrable: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: 'star_starrable',
    },
    starrableId: {
      field: 'starrable_id',
      type: DataTypes.TEXT,
      allowNull: false,
      unique: 'star_starrable',
      references: null,
    },
  });

  Star.associate = function (models) {
    Star.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
        unique: 'star_starrable',
      },
      onDelete: 'CASCADE',
    });
  };

  return Star;
}
