import { randomHexString } from './utils';

export default function (sequelize, DataTypes) {
  const Invite = sequelize.define('invite', {
    code: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: () => randomHexString(20),
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  Invite.associate = function (models) {
    Invite.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id',
      },
      onDelete: 'CASCADE',
    });
  };

  Invite.postAssociate = function (models) {
    Invite.INCLUDE_USER = {
      include: models.User,
    };

    Invite.prototype.toData = function () {
      return {
        code: this.code,
        note: this.note,
        user: this.user ? this.user.username : null,
        created: this.created_at,
      };
    };
  };

  return Invite;
}
