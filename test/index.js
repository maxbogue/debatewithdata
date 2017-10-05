import { sequelize } from '../models';

beforeEach(function () {
  return sequelize.sync({ force: true });
});

after(function () {
  sequelize.close();
});
