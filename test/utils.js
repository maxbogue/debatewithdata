import { User } from '../models';

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

export default {
  createUser: function (n) {
    return User.register(USERNAME + (n ? n : ''), PASSWORD, EMAIL);
  },
};
