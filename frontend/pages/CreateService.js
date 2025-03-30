export default {
    data() {
        return {
            service: {
                name: '',
                description: '',
                min_time_required: '',
                base_payment: ''
            },
            message: null,
            category: null
        };
    },
    methods: {
      
        async submitForm() {
            console.log("inside submit form")
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) {
                    this.message = "Unauthorized: No token found.";
                    this.category = "danger";
                    return;
                }
                
   
                const response = await fetch('/createservice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': `${token}`
                    },
                    
                    body: JSON.stringify({
                        name: this.service.name,
                        description: this.service.description,
                        min_time_required: this.service.min_time_required,
                        base_payment: this.service.base_payment
                    })
                });
  
                if (response.ok) {
                    this.message = "Service created successfully!";
                    this.category = "success";
                    this.service = { name: '', description: '', min_time_required: '', base_payment: '' }; // Reset form
                } else {
                    const errorData = await response.json();
                    this.message = errorData.message || "An error occurred.";
                    this.category = "danger";
                }
            } catch (error) {
                this.message = "An unexpected error occurred.";
                this.category = "danger";
            }
        }
    },
    template: `
        <div class="container d-flex justify-content-center align-items-center vh-100" 
             style="background: linear-gradient(135deg, #4567b7, #6495ed);">
            <div class="card p-4 shadow-lg text-center" style="width: 400px; border-radius: 10px;">
                <h3 class="text-center text-primary mb-4">Create New Service</h3>
                
                <div v-if="message" :class="'alert alert-' + category" role="alert">
                    {{ message }}
                </div>
  
                <form @submit.prevent="submitForm">
                    <div class="form-group mb-3">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Service Name:</span>
                            </div>
                            <input type="text" v-model="service.name" class="form-control" required>
                        </div>
                    </div>
  
                    <div class="form-group mb-3">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Description:</span>
                            </div>
                            <textarea v-model="service.description" class="form-control" required></textarea>
                        </div>
                    </div>
  
                    <div class="form-group mb-3">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Min Time Required (minutes):</span>
                            </div>
                            <input type="number" v-model="service.min_time_required" class="form-control" required>
                        </div>
                    </div>
  
                    <div class="form-group mb-3">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Base Payment:</span>
                            </div>
                            <input type="number" v-model="service.base_payment" class="form-control" required>
                        </div>
                    </div>
  
                    <div class="form-group text-center">
                        <button type="submit" class="btn btn-primary w-100 mb-3">Create</button>
                        <router-link to="/admin-dashboard" class="btn btn-secondary w-100">Cancel</router-link>
                    </div>
                </form>
            </div>
        </div>
    `
  };
