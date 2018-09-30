import { axiosErrorToString } from '@/utils';

export default () => ({
  namespaced: true,
  state: {
    suppressRoutes: false,
    loading: false,
    loadingError: '',
    modalError: '',
  },
  mutations: {
    setSuppressRoutes(state, suppressRoutes) {
      state.suppressRoutes = suppressRoutes;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setLoadingError(state, err) {
      state.loadingError = axiosErrorToString(err);
    },
    setModalError(state, modalError) {
      state.modalError = modalError;
    },
  },
});
