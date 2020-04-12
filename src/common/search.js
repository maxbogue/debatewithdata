import elasticlunr from 'elasticlunr';

import { ItemType } from '@/common/constants';

function unwrapResult(result) {
  const [typeKey, id] = result.ref.split('|');
  const type = {
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

  query(q, types) {
    let items = this.index
      .search(q, {
        bool: 'AND',
        expand: true,
      })
      .map(unwrapResult);
    if (types) {
      items = items.filter(item => types.includes(item.type));
    }
    return items;
  }
}

export default new Search();
