import chai from 'chai';

import { Blob } from '@/models';

const expect = chai.expect;

const FOO = 'foo';
const BAR = 'bar';

describe('Blob', function () {
  describe('.fromText()', function () {
    it('lookup succeeds', async function () {
      const blob = await Blob.fromText(FOO);
      const fromStore = await Blob.findOne({ where: { hash: blob.hash } });
      expect(fromStore.text).to.equal(FOO);
    });

    it('stores two separately', async function () {
      const blob1 = await Blob.fromText(FOO);
      expect(await Blob.count()).to.equal(1);
      expect(blob1.text).to.equal(FOO);

      const blob2 = await Blob.fromText(BAR);
      expect(await Blob.count()).to.equal(2);
      expect(blob2.text).to.equal(BAR);
      expect(blob2.hash).to.not.equal(blob1.hash);
    });

    it('collapses duplicates', async function () {
      const blob1 = await Blob.fromText(FOO);
      expect(await Blob.count()).to.equal(1);
      expect(blob1.text).to.equal(FOO);

      const blob2 = await Blob.fromText(FOO);
      expect(await Blob.count()).to.equal(1);
      expect(blob2.text).to.equal(FOO);
      expect(blob2.hash).to.equal(blob1.hash);
    });
  });
});
