export default () => ({
  namespaced: true,
  state: {
    itemBlocks: [],
    itemLocations: {},
    itemBlockSliding: false,
  },
  mutations: {
    register(state, vm) {
      state.itemBlocks.push(vm);
    },
    unregister(state, vm) {
      const i = state.itemBlocks.indexOf(vm);
      if (i < 0) {
        console.warn('Missing item block.');
      } else {
        state.itemBlocks.splice(i, 1);
      }
    },
    storeLocations(state) {
      state.itemLocations = {};
      state.itemBlockSliding = false;
      for (const vm of state.itemBlocks) {
        state.itemLocations[vm.id] = vm.$el.getBoundingClientRect();
      }
    },
    setSliding(state) {
      state.itemBlockSliding = true;
    },
  },
});
