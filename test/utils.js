import { Claim, Invite, Source, Topic, User } from '../models';

export const FOO = 'foo is too short';
export const BAR = 'bar is too short';
export const BAZ = 'baz is too short';

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

const STARS_AND_COMMENTS = {
  star: {
    count: 0,
    starred: false,
  },
  commentCount: 0,
};

export async function registerAndVerifyUser(n) {
  let invite = await Invite.create({ note: 'test' });
  let username = USERNAME + (n ? n : '');
  let user = await User.register(username, PASSWORD, EMAIL, invite.code);
  return User.verifyEmail(user.emailVerificationToken);
}

export const TestTopic = {
  TEXT: 'this is a test topic',
  TITLE: 'Dwd Testing',
  ID: 'dwd-testing',
  create: function (user) {
    return Topic.apiCreate(user, {
      id: this.ID,
      text: this.TEXT,
      title: this.TITLE,
      subTopicIds: [],
      claimIds: [],
    });
  },
  verify: function (topicRev) {
    return {
      id: this.ID,
      revId: topicRev.id,
      text: this.TEXT,
      title: this.TITLE,
      subTopicIds: [],
      claimIds: [],
      depth: 3,
      ...STARS_AND_COMMENTS,
    };
  },
};

export const TestClaim = {
  TEXT: 'this is a test claim',
  create: function (user) {
    return Claim.apiCreate(user, {
      text: this.TEXT,
      points: [[], []],
    });
  },
  verify: function (claimRev, includePoints=true) {
    let ret = {
      id: claimRev.claimId,
      revId: claimRev.id,
      text: this.TEXT,
      depth: 3,
      ...STARS_AND_COMMENTS,
    };
    if (includePoints) {
      ret.points = [{}, {}];
    }
    return ret;
  },
};

export const TestSource = {
  TEXT: 'this is a test source',
  URL: 'https://debatewithdata.org',
  create: function (user) {
    return Source.apiCreate(user, {
      text: this.TEXT,
      url: this.URL,
      type: 'misc',
    });
  },
  verify: function (sourceRev) {
    return {
      id: sourceRev.sourceId,
      revId: sourceRev.id,
      text: this.TEXT,
      url: this.URL,
      type: 'misc',
      claimIds: [],
      commentCount: 0,
    };
  },
};
