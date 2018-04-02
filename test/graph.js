import chai from 'chai';

import { Graph } from '../common/graph';
import { ValidationError } from './validate';

const expect = chai.expect;

const A = 'a';
const B = 'b';
const C = 'c';
const D = 'd';

describe('graph', function () {
  let graph;

  beforeEach(function () {
    graph = new Graph();
  });

  describe('counts', function () {
    it('basic', function () {
      graph.updateChildren(A, [B, C]);
      expect(graph.getCount(A)).to.equal(2);
      expect(graph.getCount(B)).to.equal(0);
      expect(graph.getCount(C)).to.equal(0);

      graph.updateChildren(C, [D]);
      expect(graph.getCount(A)).to.equal(3);
      expect(graph.getCount(B)).to.equal(0);
      expect(graph.getCount(C)).to.equal(1);
      expect(graph.getCount(D)).to.equal(0);

      graph.updateChildren(C, []);
      expect(graph.getCount(A)).to.equal(2);
      expect(graph.getCount(B)).to.equal(0);
      expect(graph.getCount(C)).to.equal(0);
      expect(graph.getCount(D)).to.equal(0);
    });

    it('cycle', function () {
      graph.updateChildren(A, [B]);
      graph.updateChildren(B, [C]);
      expect(graph.getCount(A)).to.equal(2);
      expect(graph.getCount(B)).to.equal(1);
      expect(graph.getCount(C)).to.equal(0);

      expect(() => graph.updateChildren(C, [A])).to.throw(ValidationError);

      // Check that it still functions after failed update.
      graph.updateChildren(C, [D]);
      expect(graph.getCount(A)).to.equal(3);
      expect(graph.getCount(B)).to.equal(2);
      expect(graph.getCount(C)).to.equal(1);
      expect(graph.getCount(D)).to.equal(0);
    });
  });
});
