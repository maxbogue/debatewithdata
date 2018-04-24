import { ValidationError } from './validate';

function difference(a, b) {
  let c = new Set(a);
  for (let e of b) {
    c.delete(e);
  }
  return c;
}

function union(a, b) {
  let c = new Set(a);
  for (let e of b) {
    c.add(e);
  }
  return c;
}

class Node {
  constructor (id) {
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
    for (let child of children) {
      child.cycleCheck(child.getChildren(), path.concat(this.id));
    }
  }

  walk(seen) {
    if (!seen) {
      seen = new Set();
    }
    if (seen.has(this.id)) {
      return;
    }
    seen.add(this.id);
    for (let child of this.getChildren()) {
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
    for (let parent of this.parents) {
      // Use the set to prevent scanning this entire subtree for the parent.
      parent.update(new Set(seen));
    }
  }

  updateParents(newChildren) {
    // Check for cycles before changing anything.
    this.cycleCheck(newChildren);

    let oldChildren = this.getChildren();
    let added = difference(newChildren, oldChildren);
    let removed = difference(oldChildren, newChildren);
    for (let node of added) {
      node.parents.add(this);
    }
    for (let node of removed) {
      node.parents.delete(this);
    }
  }
}

class TopicNode extends Node {
  constructor (id) {
    super(id);
    this.children = new Set();
  }

  getChildren() {
    return this.children;
  }

  setChildren(children) {
    let newChildren = children;
    this.updateParents(newChildren);
    this.children = children;
    this.update();
  }
}

class ClaimNode extends Node {
  constructor (id) {
    super(id);
    this.points = [new Set(), new Set()];
  }

  getChildren() {
    return this.points.reduce(union);
  }

  setChildren(points) {
    let newChildren = points.reduce(union);
    this.updateParents(newChildren);
    this.points = points;
    this.update();
  }
}

class SourceNode extends Node {
  constructor (id) {
    super(id);
    this.children = new Set();
  }

  getChildren() {
    return this.children;
  }
}

// Outside Graph so it doesn't pollute the interface.
function getOrCreate(nodes, info) {
  let node = nodes.get(info.id);
  if (node) {
    return node;
  }

  switch (info.type) {
  case 'topic':
    node = new TopicNode(info.id);
    break;
  case 'claim':
    node = new ClaimNode(info.id);
    break;
  case 'source':
    node = new SourceNode(info.id);
    break;
  default:
    throw new Error('Invalid graph info: ' + info);
  }
  nodes.set(info.id, node);
  return node;
}

function infosToNodes(nodes, childInfos) {
  let children = new Set();
  for (let childInfo of childInfos) {
    children.add(getOrCreate(nodes, childInfo));
  }
  return children;
}

export class Graph {
  constructor() {
    this.nodes = new Map();
  }

  updateTopicChildren(id, childInfos) {
    let node = getOrCreate(this.nodes, { id, type: 'topic' });
    node.setChildren(infosToNodes(this.nodes, childInfos));
  }

  updateClaimPoints(id, pointInfos) {
    let node = getOrCreate(this.nodes, { id, type: 'claim' });
    let points = pointInfos.map(
        (sideInfos) => infosToNodes(this.nodes, sideInfos));
    node.setChildren(points);
  }

  getCount(id) {
    let node = this.nodes.get(id);
    return node ? node.count : 0;
  }

  static toTopicInfo(item) {
    let id = typeof item === 'string' ? item : item.id;
    return { id, type: 'topic' };
  }

  static toClaimInfo(item) {
    let id = typeof item === 'string' ? item : item.id;
    return { id, type: 'claim' };
  }

  static toSourceInfo(item) {
    let id = typeof item === 'string' ? item : item.id;
    return { id, type: 'source' };
  }
}

export default new Graph();
