import VueRouter from 'vue-router';
import Vuex from 'vuex';
import sinon from 'sinon';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { expect } from 'chai';

import ClaimEdit from '@/pages/ClaimEdit.vue';
import { DwdUtilsMixin } from '@/utils';
import { ItemType } from '@/common/constants';
import { genId } from '@/models/utils';

const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(Vuex);
localVue.mixin(DwdUtilsMixin);

describe('ClaimEdit.vue', function () {
  let id;
  let actions;
  let store;
  let router;

  beforeEach(function () {
    id = genId();
    actions = {
      addItem: sinon.stub().resolves(id),
    };
    store = new Vuex.Store({
      state: {
        claims: {},
      },
      actions,
    });
    router = new VueRouter();
    sinon.spy(router, 'push');
  });

  it('submits and redirects', async function () {
    const wrapper = shallowMount(ClaimEdit, { store, router, localVue });
    const newClaim = {
      text: 'this is a test claim',
      flag: null,
    };
    wrapper.vm.newClaimPartial = newClaim;
    await wrapper.vm.submit();
    expect(actions.addItem.args[0][1]).to.deep.equal({
      type: ItemType.CLAIM,
      item: {
        ...newClaim,
        newSources: [],
        newSubClaims: [],
        sourceIds: {},
        subClaimIds: {},
      },
    });
    expect(router.push.args[0][0]).to.equal(`/${ItemType.CLAIM}/${id}`);
  });
});
