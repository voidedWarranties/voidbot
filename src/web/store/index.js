export const state = () => ({
    user: {},
    pageData: {}
});

export const mutations = {
    user(state, user) {
        state.user = user;
    },
    pageData(state, data) {
        state.pageData = data;
    }
};

export const actions = {
    nuxtServerInit({ commit }, { req, res }) {
        if (req.user) {
            commit("user", req.user);
        }

        if (res.locals) {
            commit("pageData", res.locals);
        }
    }
};