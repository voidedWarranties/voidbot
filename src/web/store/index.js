export const state = () => ({
    user: {},
    pageData: {},
    botName: ""
});

export const mutations = {
    user(state, user) {
        state.user = user;
    },
    pageData(state, data) {
        state.pageData = data;
    },
    botName(state, name) {
        state.botName = name;
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

        commit("botName", process.env.BOT_NAME);
    }
};