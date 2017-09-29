import fs from 'fs';

import { sequelize, Blob, Claim, ClaimRev, Point, PointRev, Source, SourceRev,
  User } from './models';

let db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));

async function migrateSource(user, sourceId) {
  let headId = db.source[sourceId].head;
  let head = db.source_rev[headId];
  if (head.deleted) {
    return;
  }
  let text = db.blob[head.text];
  let blob = await Blob.fromText(text);
  let source = await Source.create({
    id: sourceId,
  });
  let rev = await SourceRev.create({
    id: headId,
    user_id: user.id,
    source_id: sourceId,
    blob_hash: blob.hash,
    url: head.url,
    ary: head.ary,
  });
  await source.setHead(rev);
  head.deleted = true;
}

async function migratePoint(user, revId) {
  let head = db.point_rev[revId];
  let blob_hash, text, blob;
  switch (head.type) {
  case 'text':
  case 'subclaim':
    text = db.blob[head.text];
    blob = await Blob.fromText(text);
    blob_hash = blob.hash;
    break;
  case 'source':
    await migrateSource(user, head.sourceId);
    break;
  case 'claim':
    await migrateClaim(user, head.claimId);
    break;
  }
  let point = await Point.create();
  let pointRev = await PointRev.create({
    id: revId,
    user_id: user.id,
    point_id: point.id,
    blob_hash: blob_hash,
    claim_id: head.claimId,
    source_id: head.sourceId,
    type: head.type,
  });
  await point.setHead(pointRev);
  if (head.type === 'subclaim') {
    await migratePoints(user, pointRev, head.points);
  }
  return pointRev;
}

async function migratePoints(user, rev, points) {
  for (let i = 0; i < 2; i++) {
    for (let revId of points[i]) {
      let pointRev = await migratePoint(user, revId);
      await rev.addPointRev(pointRev, {
        through: { isFor: i === 0 },
      });
    }
  }
}

async function migrateClaim(user, claimId) {
  let headId = db.claim[claimId].head;
  let head = db.claim_rev[headId];
  if (head.deleted) {
    return;
  }
  let text = db.blob[head.text];
  let blob = await Blob.fromText(text);
  let claim = await Claim.create({
    id: claimId,
  });
  let rev = await ClaimRev.create({
    id: headId,
    user_id: user.id,
    claim_id: claimId,
    blob_hash: blob.hash,
  });
  await claim.setHead(rev);
  await migratePoints(user, rev, head.points);
  head.deleted = true;
}

export default async function() {
  /* eslint guard-for-in: 0 */
  await sequelize.sync({force: true});
  let user = await User.register('max', '', 'max@maxbogue.com');
  for (let sourceId in db.source) {
    await migrateSource(user, sourceId);
  }
  for (let id in db.claim) {
    await migrateClaim(user, id);
  }
}
