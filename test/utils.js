import { Claim, Source, Topic, User } from '@/models';
import { SourceType } from '@/common/constants';

export const FOO = 'foo is too short';
export const BAR = 'bar is too short';
export const BAZ = 'baz is too short';

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

export const STARS_AND_COMMENTS = {
  starCount: 0,
  starred: false,
  watched: true,
  commentCount: 0,
};

export async function registerAndVerifyUser(n) {
  let username = USERNAME + (n ? n : '');
  let user = await User.register(username, PASSWORD, EMAIL);
  return User.verifyEmail(user.emailVerificationToken);
}

export const TestTopic = {
  TEXT: 'this is a test topic',
  TITLE: 'Dwd Testing',
  ID: 'dwd-testing',
  create(user) {
    return Topic.apiCreate(user, {
      id: this.ID,
      text: this.TEXT,
      title: this.TITLE,
      subTopicIds: [],
      claimIds: [],
    });
  },
  verify(topicRev) {
    return {
      id: this.ID,
      isRoot: false,
      revId: topicRev.id,
      text: this.TEXT,
      title: this.TITLE,
      subTopicIds: [],
      claimIds: [],
      superTopicIds: [],
      depth: 3,
      childCount: 0,
      ...STARS_AND_COMMENTS,
    };
  },
};

export const TestClaim = {
  TEXT: 'this is a test claim',
  create(user) {
    return Claim.apiCreate(user, {
      text: this.TEXT,
    });
  },
  verify(claimRev) {
    return {
      id: claimRev.claimId,
      revId: claimRev.id,
      text: this.TEXT,
      flag: null,
      needsData: null,
      subClaimIds: {},
      sourceIds: {},
      superTopicIds: [],
      superClaimIds: [],
      depth: 3,
      childCount: 0,
      dataCounts: [0, 0],
      ...STARS_AND_COMMENTS,
    };
  },
};

export const TestSource = {
  TEXT: 'this is a test source',
  URL: 'https://debatewithdata.org',
  create(user) {
    return Source.apiCreate(user, {
      text: this.TEXT,
      url: this.URL,
      type: SourceType.MISC,
    });
  },
  verify(sourceRev) {
    return {
      id: sourceRev.sourceId,
      revId: sourceRev.id,
      text: this.TEXT,
      url: this.URL,
      type: SourceType.MISC,
      claimIds: [],
      ...STARS_AND_COMMENTS,
    };
  },
};
