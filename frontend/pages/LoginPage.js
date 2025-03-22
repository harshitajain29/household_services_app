export default {
    template : `
    <div>
        <input placeholder="email" v-model="email"/>
        <input placeholder="password" v-model="password"/>
        <button class='btn btn-primary' @click="submitLogin"> Login </button>
    </div>
    `,
    data(){
        return {
            email : null,
            password : null,
        }
    },
    methods : {
        async submitLogin() {
                await fetch(location.origin + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'email': this.email, 'password': this.password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('token', data.token)
                    if (data.role === 'admin') {
                        this.$router.push({ name: 'admin-dashboard' })
                    } else if (data.role === 'customer') {
                        this.$router.push({ name: 'customer-dashboard' })
                    } else if (data.role === 'professional-dashboard') {
                        this.$router.push({ name: 'professional-dashboard' })
                    }
                } else {
                    console.error('Invalid credentials')
                }
            })
        },

    }
}
