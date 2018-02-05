import { Invite, User } from '../models';

export const FOO = 'foo is too short';
export const BAR = 'bar is too short';
export const BAZ = 'baz is too short';

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

export async function registerAndVerifyUser(n) {
  let invite = await Invite.create({ note: 'test' });
  let username = USERNAME + (n ? n : '');
  let user = await User.register(username, PASSWORD, EMAIL, invite.code);
  return User.verifyEmail(user.emailVerificationToken);
}
