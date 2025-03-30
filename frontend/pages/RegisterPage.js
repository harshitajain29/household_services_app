export default {  
    template: `
    <div class="container d-flex justify-content-center align-items-center vh-100" 
         style="background: linear-gradient(135deg, #4567b7, #6495ed); height: 100vh;">
        <div class="card p-4 shadow-lg text-center" style="width: 400px; border-radius: 10px;">
            <h3 class="text-center text-primary mb-4">Register</h3>

            <div class="form-group mb-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                    </div>
                    <input class="form-control" placeholder="First Name" v-model="fname"/> 
                </div>
            </div>
            <div class="form-group mb-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                    </div>
                    <input class="form-control" placeholder="Last Name" v-model="lname"/> 
                </div>
            </div>
            <div class="form-group mb-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                    </div>
                    <input class="form-control" placeholder="Email" v-model="email"/>  
                </div>
            </div>
            <div class="form-group mb-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    </div>
                    <input class="form-control" placeholder="Password" type="password" v-model="password"/> 
                </div>
            </div>

            <div class="form-group mb-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">City:</span>
                    </div>
                    <select class="form-control" v-model="location" id="location">
                        <option disabled value="">Choose a city</option>
                        <option>New Delhi</option>
                        <option>Bangalore</option>
                        <option>Chennai</option>
                        <option>Mumbai</option>
                        <option>Gurgaon</option>
                        <option>Noida</option>
                    </select>
                </div>
            </div>

            <div class="form-group mb-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">Role:</span>
                    </div>
                    <select class="form-control" v-model="role" id="role">
                        <option value="Customer">Customer</option>
                        <option value="Service Professional">Professional</option>
                    </select>
                </div>
            </div> 
            
            <!-- Service Professional Fields -->
            <div v-if="role === 'Service Professional'">
                <div class="form-group mb-3">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Select Service Type:</span>
                        </div>
                        <select class="form-control" v-model="serviceType" id="serviceType">
                            <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Experience (in years):</span>
                        </div>
                        <input class="form-control" type="number" v-model="experience" id="experience" />
                    </div>
                </div>
                <div class="form-group mb-3">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Aadhar Number:</span>
                        </div>
                        <input class="form-control" type="text" v-model="aadharNumber" id="aadharNumber" />
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary w-100 mt-3" @click="submitRegister">Register</button>
        </div>
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
            aadharNumber: '',
            services: []
        };
    },

    mounted() {
        this.loadServices();
    },

    methods: {
        async loadServices() {
            try {
                const response = await axios.get('/api/services');  
                this.services = response.data;  
                console.log("📌 Services loaded:", this.services); 
            } catch (error) {
                console.error("❌ Error loading services:", error);
            }
        },

        async submitRegister() {  
            const payload = {
                email: this.email,
                password: this.password,
                fname: this.fname,
                lname: this.lname,
                location: this.location,
                role: this.role,
                serviceType: this.role === "Service Professional" ? this.serviceType : null,
                experience: this.role === "Service Professional" ? this.experience : null,
                aadharNumber: this.role === "Service Professional" ? this.aadharNumber : null
            };
        
            console.log("📌 Sending Data:", payload);
        
            try {
                const res = await fetch(location.origin + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
        
                if (res.ok) {
                    console.log('✅ User registered successfully');
                    const data = await res.json();
                    localStorage.setItem('user', JSON.stringify(data));
                    this.$store.commit('setUser');
                    this.$router.push('/login');
                } else {
                    const errorData = await res.json();
                    console.error("❌ Registration failed:", errorData.message);
                    alert(errorData.message);
                }
            } catch (error) {
                console.error("❌ Error during registration:", error);
            }
        }
    }
};
