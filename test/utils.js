import { Invite, User } from '../models';

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

export async function registerAndVerifyUser(n) {
  let invite = await Invite.create();
  let username = USERNAME + (n ? n : '');
  let user = await User.register(username, PASSWORD, EMAIL, invite.code);
  return User.verifyEmail(user.emailVerificationToken);
}
