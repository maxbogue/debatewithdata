import { ValidationError } from './validate';

function difference(a, b) {
  let c = new Set(a);
  for (let k of b) {
    c.delete(k);
  }
  return c;
}

class Node {
  constructor (id) {
    this.id = id;
    this.children = new Set();
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
      child.cycleCheck(child.children, path.concat(this.id));
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
    for (let child of this.children) {
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

  setChildren(children) {
    // Check for cycles before changing anything.
    this.cycleCheck(children);

    let added = difference(children, this.children);
    let removed = difference(this.children, children);
    for (let node of added) {
      node.parents.add(this);
    }
    for (let node of removed) {
      node.parents.delete(this);
    }
    this.children = children;
    this.update();
  }
}

// Outside Graph so it doesn't pollute the interface.
function getOrCreate(nodes, id) {
  let node = nodes.get(id);
  if (node) {
    return node;
  }

  node = new Node(id);
  nodes.set(id, node);
  return node;
}

export class Graph {
  constructor() {
    this.nodes = new Map();
  }

  updateChildren(id, childIds) {
    let node = getOrCreate(this.nodes, id);
    let children = new Set();
    for (let childId of childIds) {
      children.add(getOrCreate(this.nodes, childId));
    }
    node.setChildren(children);
  }

  getCount(id) {
    return getOrCreate(this.nodes, id).count;
  }
}

export default new Graph();
