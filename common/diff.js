export function pointsAreSame(p1, p2) {
  if (p1.type !== p2.type) {
    return false;
  }
  switch (p1.type) {
  case 'claim':
    return p1.claimId === p2.claimId;
  case 'source':
    return p1.sourceId === p2.sourceId;
  default:
    return p1.text === p2.text && p1.flag === p2.flag;
  }
}
