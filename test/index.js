import { knex, sequelize } from '../src/models';

beforeEach(function () {
  return sequelize.truncate({ cascade: true });
});

after(function () {
  knex.destroy();
  sequelize.close();
});
