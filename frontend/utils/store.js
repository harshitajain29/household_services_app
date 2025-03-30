
const store = new Vuex.Store({
    state: {
        // like data
        auth_token: null,
        role: null,
        loggedIn: false,
        user_id: null,
        location: null,  // ✅ Add location
    },
    mutations: {
        // functions that change state
        setUser(state) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    state.auth_token = user.token;
                    state.role = user.role;
                    state.loggedIn = true;
                    state.user_id = user.id;
                    state.location = user.location;  // ✅ Add location
                }
            } catch {
                console.warn('not logged in');
            }
        },
        logout(state) {
            state.auth_token = null;
            state.role = null;
            state.loggedIn = false;
            state.user_id = null;
            state.location = null;  // ✅ Reset location on logout

            localStorage.removeItem('user');
        }
    },
    actions: {
        // actions commit mutations can be async
    }
});

// Initialize Vuex store state from localStorage
store.commit('setUser');

export default store;
