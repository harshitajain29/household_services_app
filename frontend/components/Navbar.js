export default {
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <router-link class="navbar-brand" to="/">Service Booking App</router-link>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    

                    <!-- Customer Navbar -->
                    <template v-if="role === 'Customer'">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/customerlanding">Services</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/customer-requests">My Requests</router-link>
                        </li>
                    </template>

                    <!-- Service Professional Navbar -->
                    <template v-else-if="role === 'Service Professional'">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/professional-dashboard">Dashboard</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/professional-requests">Assigned Jobs</router-link>
                        </li>
                        
                    </template>

                    <!-- Admin Navbar -->
                    <template v-else-if="role === 'admin'">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/admin-dashboard">Dashboard</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/admin/users">Manage Users</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/admin/stats-overview">Stats</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/admin/services">View Services</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/createservice">Create Service</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/service-professionals">View Service Professionals</router-link>
                        </li>
                    </template>
                </ul>

                <!-- Right Side: Login/Logout -->
                <ul class="navbar-nav">
                    <template v-if="isLoggedIn">
                        <li class="nav-item">
                            <button class="btn btn-outline-danger btn-sm" @click="logout">Logout</button>
                        </li>
                    </template>
                    <template v-else>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/login">Login</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/register">Register</router-link>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </nav>
    `,

    data() {
        return {
            role: null,
            isLoggedIn: false
        };
    },

    created() {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            this.role = user.role;
            this.isLoggedIn = true;
        }
    },

    methods: {
        logout() {
            localStorage.removeItem("user"); // Clear stored user data
            this.isLoggedIn = false;
            this.role = null;
            this.$router.push("/login"); // Redirect to login page
        }
    }
};