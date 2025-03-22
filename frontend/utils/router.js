const Home = {
    template : `<h1> this is home </h1>`
}
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";

import CreateService from "../pages/CreateService.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import CustomerDashboard from "../pages/CustomerDashboard.js";
import ProfessionalDashboard from "../pages/ProfessionalDashboard.js";

const routes = [
    {path: '/', component : Home},
    {path: '/login', component : LoginPage},
    {path: '/register', component : RegisterPage},
    {
        path: '/admin-dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard
    },
    {
        path: '/customer-dashboard',
        name: 'customer-dashboard',
        component: CustomerDashboard
    },
    {
        path: '/professional-dashboard',
        name: 'professional-dashboard',
        component: ProfessionalDashboard
    },
    {
        path: '/create-service',
        name: 'create-service',
        component: CreateService
    }
    ]

const router = new VueRouter({
    routes
})

export default router;