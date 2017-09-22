export default function (sequelize, DataTypes) {
  const Star = sequelize.define('star', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'star_starrable',
    },
    starrable: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: 'star_starrable',
    },
    starrable_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: 'star_starrable',
      references: null,
    },
  });

  return Star;
}
