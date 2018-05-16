import elasticlunr from 'elasticlunr';

import { ItemType } from '../common/constants';

function unwrapResult(result) {
  let [typeKey, id] = result.ref.split('|');
  let type = {
    t: ItemType.TOPIC,
    c: ItemType.CLAIM,
    s: ItemType.SOURCE,
  }[typeKey];
  return { type, id };
}

export class Search {
  constructor() {
    this.index = elasticlunr(function () {
      /* eslint no-invalid-this: "off" */
      this.addField('title');
      this.addField('text');
    });
  }

  updateTopic(topic) {
    this.index.updateDoc({
      ...topic,
      id: 't|' + topic.id,
    });
  }

  updateClaim(claim) {
    this.index.updateDoc({
      ...claim,
      id: 'c|' + claim.id,
    });
  }

  updateSource(source) {
    this.index.updateDoc({
      ...source,
      id: 's|' + source.id,
    });
  }

  query(q, limit=5) {
    return this.index.search(q, {
      bool: 'AND',
      expand: true,
    }).slice(0, limit).map(unwrapResult);
  }
}
