import chai from 'chai';

import { Graph } from '@/common/graph';
import { ValidationError } from '@/common/validate';

const expect = chai.expect;

const t = Graph.toTopicInfo;
const c = Graph.toClaimInfo;

const A = 'a';
const B = 'b';
const C = 'c';
const D = 'd';

describe('graph', function() {
  let graph;

  beforeEach(function() {
    graph = new Graph();
  });

  describe('counts', function() {
    it('basic', function() {
      graph.updateTopicChildren(A, [t(B), t(C)]);
      expect(graph.getCount(A)).to.equal(2);
      expect(graph.getCount(B)).to.equal(0);
      expect(graph.getCount(C)).to.equal(0);

      graph.updateTopicChildren(C, [t(D)]);
      expect(graph.getCount(A)).to.equal(3);
      expect(graph.getCount(B)).to.equal(0);
      expect(graph.getCount(C)).to.equal(1);
      expect(graph.getCount(D)).to.equal(0);

      graph.updateTopicChildren(C, []);
      expect(graph.getCount(A)).to.equal(2);
      expect(graph.getCount(B)).to.equal(0);
      expect(graph.getCount(C)).to.equal(0);
      expect(graph.getCount(D)).to.equal(0);
    });

    it('cycle', function() {
      graph.updateClaimPoints(A, [[c(B)], []]);
      graph.updateClaimPoints(B, [[c(C)], []]);
      expect(graph.getCount(A)).to.equal(2);
      expect(graph.getCount(B)).to.equal(1);
      expect(graph.getCount(C)).to.equal(0);

      expect(() => graph.updateClaimPoints(C, [[c(A)], []])).to.throw(
        ValidationError
      );

      // Check that it still functions after failed update.
      graph.updateClaimPoints(C, [[c(D)], []]);
      expect(graph.getCount(A)).to.equal(3);
      expect(graph.getCount(B)).to.equal(2);
      expect(graph.getCount(C)).to.equal(1);
      expect(graph.getCount(D)).to.equal(0);
    });
  });
});
