export default {
    template: `
        <div class="container d-flex justify-content-center align-items-center vh-100" 
             style="background: linear-gradient(135deg, #4567b7, #6495ed);">
            <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
                <h2 class="mb-3 text-primary">Manage Services</h2>
                <table class="table table-bordered">
                    <thead class="thead-dark">
                        <tr>
                            <th>Service Name</th>
                            <th>Service Details</th>
                            <th>Payment</th>
                            <th>Duration Estimate</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="service in services" :key="service.id">
                            <td>{{ service.name }}</td>
                            <td>{{ service.description }}</td>
                            <td>{{ service.base_payment }}</td>
                            <td>{{ service.min_time }}</td>
                            <td>
                                <button class="btn btn-warning btn-sm" @click="openEditModal(service)">Edit</button>
                                <button class="btn btn-danger btn-sm" @click="confirmDelete(service.id)">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Edit Service Modal -->
                <div v-if="selectedService" class="modal fade show d-block" @click.self="closeModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit Service</h5>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>
                            <div class="modal-body">
                                <label>Service Name:</label>
                                <input type="text" v-model="selectedService.name" class="form-control"/>
                                
                                <label>Description:</label>
                                <textarea v-model="selectedService.description" class="form-control"></textarea>
                                
                                <label>Base Price:</label>
                                <input type="number" v-model="selectedService.base_payment" class="form-control" min="0"/>
                                
                                <label>Minimum Time:</label>
                                <input type="text" v-model="selectedService.min_time" class="form-control"/>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary btn-sm" @click="closeModal">Cancel</button>
                                <button class="btn btn-primary btn-sm" @click="updateService">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            services: [],
            selectedService: null,
        };
    },
    methods: {
        async fetchServices() {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) {
                    this.message = "Unauthorized: No token found.";
                    this.category = "danger";
                    return;
                }
                const response = await fetch('/admin/services', { method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': `${token}`
                    }
                 });
                if (response.ok) {
                    this.services = await response.json();
                } else {
                    alert("Failed to load services.");
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },
        openEditModal(service) {
            this.selectedService = { ...service };  // Create a copy to avoid direct mutation
        },
        closeModal() {
            this.selectedService = null;
        },
        async updateService() {
            if (this.selectedService.base_payment < 0) {
                alert("Base Price must be a positive number.");
                return;
            }

            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) {
                    this.message = "Unauthorized: No token found.";
                    this.category = "danger";
                    return;
                }
                const response = await fetch(`/admin/services/${this.selectedService.id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': `${token}`
                    },

                    body: JSON.stringify(this.selectedService)
                });

                if (response.ok) {
                    alert("Service updated successfully.");
                    this.fetchServices();  // Refresh table data
                    this.closeModal();
                } else {
                    alert("Failed to update service.");
                }
            } catch (error) {
                console.error("Error updating service:", error);
            }
        },
        confirmDelete(serviceId) {
            if (confirm("Are you sure you want to delete this service?")) {
                this.deleteService(serviceId);
            }
        },
        async deleteService(serviceId) {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) {
                    this.message = "Unauthorized: No token found.";
                    this.category = "danger";
                    return;
                }
                const response = await fetch(`/admin/services/${serviceId}`, { method: "DELETE" ,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': `${token}`
                    }
                });
                if (response.ok) {
                    alert("Service deleted successfully.");
                    this.fetchServices();
                } else {
                    alert("Failed to delete service.");
                }
            } catch (error) {
                console.error("Error deleting service:", error);
            }
        }
    },
    mounted() {
        this.fetchServices();
    }
};
