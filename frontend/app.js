import Navbar from "./components/Navbar.js";
import router from "./utils/router.js";
import store from "./utils/store.js";

const app = new Vue({
    el: "#app",
    template: `
        <div> 
            <Navbar v-if="showNavbar" />
            <router-view></router-view>
        </div>
    `,
    components: {
        Navbar
    },
    router,
    store,
    computed: {
        showNavbar() {
            return this.$route.path !== "/login"; // Hide navbar if on login page
        }
    }
});