import { sequelize } from '../models';

beforeEach(function () {
  return sequelize.truncate({ cascade: true });
});

after(function () {
  sequelize.close();
});
