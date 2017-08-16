import config from 'config';
import Sequelize from 'sequelize';

import makeUser from './user';

const sequelize = new Sequelize(config.get('db'), {
  define: {
    underscored: true,
  },
});

export const User = makeUser(sequelize, Sequelize.DataTypes);
