import { ItemType } from '@/common/constants';
import { ValidationError } from './validate';

function difference(a, b) {
  const c = new Set(a);
  for (const e of b) {
    c.delete(e);
  }
  return c;
}

function union(a, b) {
  const c = new Set(a);
  for (const e of b) {
    c.add(e);
  }
  return c;
}

class Node {
  constructor(id) {
    if (typeof id !== 'string') {
      throw new Error('Node IDs must be strings.');
    }
    this.id = id;
    // Parents are tracked to propagate recounts up the tree.
    this.parents = new Set();
    // Count is cached for efficiency.
    this.count = 0;
  }

  cycleCheck(children, path) {
    if (!path) {
      path = [];
    }
    if (path.includes(this.id)) {
      throw new ValidationError('Cycle found: ' + path.join(' -> '));
    }
    for (const child of children) {
      child.cycleCheck(child.getChildren(), path.concat(this.id));
    }
  }

  walk(seen) {
    if (seen.has(this.id)) {
      return;
    }
    seen.add(this.id);
    for (const child of this.getChildren()) {
      child.walk(seen);
    }
  }

  update(seen) {
    if (!seen) {
      seen = new Set();
    }
    // Get the set of all unique children.
    this.walk(seen);
    // The count is just the size of that set minus ourself.
    this.count = seen.size - 1;
    for (const parent of this.parents) {
      // Use the set to prevent scanning this entire subtree for the parent.
      parent.update(new Set(seen));
    }
  }

  updateParents(newChildren) {
    // Check for cycles before changing anything.
    this.cycleCheck(newChildren);

    const oldChildren = this.getChildren();
    const added = difference(newChildren, oldChildren);
    const removed = difference(oldChildren, newChildren);
    for (const node of added) {
      node.parents.add(this);
    }
    for (const node of removed) {
      node.parents.delete(this);
    }
  }
}

class TopicNode extends Node {
  constructor(id) {
    super(id);
    this.children = new Set();
  }

  getChildren() {
    return this.children;
  }

  setChildren(children) {
    const newChildren = children;
    this.updateParents(newChildren);
    this.children = children;
    this.update();
  }
}

class ClaimNode extends Node {
  constructor(id) {
    super(id);
    this.points = [new Set(), new Set()];
    this.dataCounts = [0, 0];
  }

  getChildren() {
    return this.points.reduce(union);
  }

  getDataCounts() {
    return this.dataCounts;
  }

  setChildren(points) {
    const newChildren = points.reduce(union);
    this.updateParents(newChildren);
    this.points = points;
    this.update();
  }

  update(seen) {
    this.updateDataCounts();
    super.update(seen);
  }

  updateDataCounts() {
    const dataCounts = [0, 0];
    for (let i = 0; i < 2; i += 1) {
      for (const child of this.points[i]) {
        const [f, a] = child.getDataCounts();
        dataCounts[i] += f;
        dataCounts[1 - i] += a;
      }
    }
    this.dataCounts = dataCounts;
  }
}

class SourceNode extends Node {
  constructor(id) {
    super(id);
  }

  getChildren() {
    return new Set();
  }

  getDataCounts() {
    return [1, 0];
  }
}

// Outside Graph so it doesn't pollute the interface.
function getOrCreate(nodes, info) {
  let node = nodes.get(info.id);
  if (node) {
    return node;
  }

  switch (info.type) {
    case ItemType.TOPIC:
      node = new TopicNode(info.id);
      break;
    case ItemType.CLAIM:
      node = new ClaimNode(info.id);
      break;
    case ItemType.SOURCE:
      node = new SourceNode(info.id);
      break;
    default:
      throw new Error('Invalid graph info: ' + info);
  }
  nodes.set(info.id, node);
  return node;
}

function infosToNodes(nodes, childInfos) {
  const children = new Set();
  for (const childInfo of childInfos) {
    children.add(getOrCreate(nodes, childInfo));
  }
  return children;
}

export class Graph {
  constructor() {
    this.nodes = new Map();
  }

  updateTopicChildren(id, childInfos) {
    const node = getOrCreate(this.nodes, { id, type: ItemType.TOPIC });
    node.setChildren(infosToNodes(this.nodes, childInfos));
  }

  updateClaimPoints(id, pointInfos) {
    const node = getOrCreate(this.nodes, { id, type: ItemType.CLAIM });
    const points = pointInfos.map(sideInfos =>
      infosToNodes(this.nodes, sideInfos)
    );
    node.setChildren(points);
  }

  getCount(id) {
    const node = this.nodes.get(id);
    return node ? node.count : 0;
  }

  getDataCounts(id) {
    const node = this.nodes.get(id);
    return node && node.dataCounts ? node.dataCounts : [0, 0];
  }

  static toTopicInfo(item) {
    const id = typeof item === 'string' ? item : item.id;
    return { id, type: ItemType.TOPIC };
  }

  static toClaimInfo(item) {
    const id = typeof item === 'string' ? item : item.id;
    return { id, type: ItemType.CLAIM };
  }

  static toSourceInfo(item) {
    const id = typeof item === 'string' ? item : item.id;
    return { id, type: ItemType.SOURCE };
  }
}

export default new Graph();
