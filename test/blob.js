import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { Blob } from '../models';

chai.use(chaiAsPromised);
chai.should();

const FOO = 'foo';
const BAR = 'bar';

describe('Blob', function () {
  beforeEach(function () {
    return Blob.sync({ force: true });
  });

  describe('.fromText()', function () {
    it('lookup succeeds', async function () {
      let blob = await Blob.fromText(FOO);
      let fromStore = await Blob.findOne({ where: { hash: blob.hash } });
      fromStore.text.should.equal(FOO);
    });

    it('stores two separately', async function () {
      let blob1 = await Blob.fromText(FOO);
      (await Blob.count()).should.equal(1);
      blob1.text.should.equal(FOO);

      let blob2 = await Blob.fromText(BAR);
      (await Blob.count()).should.equal(2);
      blob2.text.should.equal(BAR);
      blob2.hash.should.not.equal(blob1.hash);
    });

    it('collapses duplicates', async function () {
      let blob1 = await Blob.fromText(FOO);
      (await Blob.count()).should.equal(1);
      blob1.text.should.equal(FOO);

      let blob2 = await Blob.fromText(FOO);
      (await Blob.count()).should.equal(1);
      blob2.text.should.equal(FOO);
      blob2.hash.should.equal(blob1.hash);
    });
  });
});
