import config from 'config';
import Sequelize from 'sequelize';

const sequelize = new Sequelize(config.get('db'), {
  define: {
    underscored: true,
  },
});

export default sequelize;
