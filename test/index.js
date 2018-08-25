import { knex, sequelize } from '@/models';

beforeEach(function () {
  return sequelize.truncate({ cascade: true });
});

after(function () {
  knex.destroy();
  sequelize.close();
});
