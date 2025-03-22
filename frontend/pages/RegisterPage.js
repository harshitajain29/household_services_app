export default {
    template: `
        <div>
            <input placeholder="email"  v-model="email"/>  
            <input placeholder="password"  v-model="password"/> 
            <input placeholder="Firstname"  v-model="fname"/> 
            <input placeholder="Lastname"  v-model="lname"/> 
            <input placeholder="Location"  v-model="location"/> 
            <div class="form-group">
                <label for="role">Select Role:</label>
                <select v-model="role" id="role" >
                    <option value="Customer">Customer</option>
                    <option value="Service Professional">Professional</option>
                </select>
            </div> 
            <div v-if="role === 'Service Professional'">
                <div class="form-group">
                    <label for="serviceType">Select Service Type:</label>
                    <select v-model="serviceType" id="serviceType">
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Carpenter">Carpenter</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="experience">Experience (in years):</label>
                    <input type="number" v-model="experience" id="experience" />
                </div>
                <div class="form-group">
                    <label for="panNumber">PAN Number:</label>
                    <input type="text" v-model="panNumber" id="panNumber" />
                </div>
            </div>
            <button class='btn btn-primary' @click="submitRegister"> Register </button>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            fname: '',
            lname: '',
            location: '',
            role: '',
            serviceType: '',
            experience: '',
            panNumber: ''
        }
    },
    methods: {
        async submitRegister() {
            const res = await fetch(location.origin + '/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'email': this.email,
                    'password': this.password,
                    'fname': this.fname,
                    'lname': this.lname,
                    'location': this.location,
                    'role': this.role,
                    'serviceType': this.serviceType,
                    'experience': this.experience,
                    'panNumber': this.panNumber
                })
            })
            if (res.ok) {
                console.log('we are registered')
                const data = await res.json()
                console.log(data)
                localStorage.setItem('user', JSON.stringify(data))
                this.$store.commit('setUser')
                this.$router.push('/login')
            }
        }
    }
}
