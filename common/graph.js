function mapDiff(a, b) {
  let c = new Map(a);
  for (let k of b.keys()) {
    c.delete(k);
  }
  return c;
}

class Node {
  constructor () {
    this.children = new Map();
    // Parents are tracked to propagate recounts up the tree.
    this.parents = new Set();
    this.count = 0;
  }

  walkUnique(seen) {
    for (let [id, node] of this.children) {
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      node.walkUnique(seen);
    }
  }

  updateCount(seen) {
    if (!seen) {
      seen = new Set();
    }
    // Get the set of all unique children.
    this.walkUnique(seen);
    // The count is just the size of that set.
    this.count = seen.size;
    for (let parent of this.parents) {
      // Use the set to prevent scanning this entire subtree for the parent.
      parent.updateCount(new Set(seen));
    }
  }

  setChildren(children) {
    let added = mapDiff(children, this.children);
    let removed = mapDiff(this.children, children);
    for (let node of added.values()) {
      node.parents.add(this);
    }
    for (let node of removed.values()) {
      node.parents.delete(this);
    }
    this.children = children;
    this.updateCount();
  }
}

// Outside Graph so it doesn't pollute the interface.
function getOrCreate(nodes, id) {
  let node = nodes.get(id);
  if (node) {
    return node;
  }

  node = new Node();
  nodes.set(id, node);
  return node;
}

export class Graph {
  constructor() {
    this.nodes = new Map();
  }

  updateChildren(id, childIds) {
    let node = getOrCreate(this.nodes, id);
    let children = new Map();
    for (let childId of childIds) {
      children.set(childId, getOrCreate(this.nodes, childId));
    }
    node.setChildren(children);
  }

  getCount(id) {
    return getOrCreate(this.nodes, id).count;
  }
}

export default new Graph();
