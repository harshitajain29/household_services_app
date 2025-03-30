export default {
    template: `
        <div class="container d-flex justify-content-center align-items-center vh-100" 
             style="background: linear-gradient(135deg, #4567b7, #6495ed);">
            <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
                <h2 class="mb-3 text-primary">My Service Requests</h2>

                <table class="table table-striped text-center">
                    <thead class="thead-dark">
                        <tr>
                            <th>Professional</th>
                            <th>Service</th>
                            <th>Description</th>
                            <th>Base Payment</th>
                            <th>Requested On</th>
                            <th>Service Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="req in requests" :key="req.id">
                            <td>{{ req.professional_name }}</td>
                            <td>{{ req.service_name }}</td>
                            <td>{{ req.description }}</td>
                            <td>{{ req.base_payment }}</td>
                            <td>{{ req.date_of_request }}</td>
                            <td>{{ req.date_of_service }}</td>
                            <td>{{ req.status }}</td>
                            <td>
                                <!-- Update Button (Only if status = requested) -->
                                <button v-if="req.status === 'requested'" class="btn btn-warning btn-sm" @click="openEditModal(req)">Update</button>
                                
                                <!-- Delete Button (Only if status = requested) -->
                                <button v-if="req.status === 'requested'" class="btn btn-danger btn-sm" @click="confirmDelete(req.id)">Delete</button>
                                
                                <!-- Close Service Button -->
                                <button v-if="req.status === 'completed'" class="btn btn-success btn-sm" @click="openFeedback(req)">Close Service</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Update Service Request Modal -->
                <div v-if="selectedRequest" class="modal fade show d-block" @click.self="closeModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Update Service Date</h5>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>
                            <div class="modal-body">
                                <label>New Service Date:</label>
                                <input type="date" v-model="updatedDate" class="form-control"/>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary btn-sm" @click="closeModal">Cancel</button>
                                <button class="btn btn-primary btn-sm" @click="updateRequest">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Feedback Modal -->
                <div v-if="selectedFeedback" class="modal fade show d-block" @click.self="closeModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Leave Feedback</h5>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>
                            <div class="modal-body">
                                <label>Rating (1-5):</label>
                                <input type="number" v-model="feedback.rating" min="1" max="5" class="form-control"/>
                                <label>Remarks:</label>
                                <textarea v-model="feedback.remarks" class="form-control"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary btn-sm" @click="closeModal">Cancel</button>
                                <button class="btn btn-primary btn-sm" @click="submitFeedback">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            requests: [],
            selectedRequest: null,
            selectedFeedback: null,
            updatedDate: "",
            feedback: { rating: "", remarks: "" },
        };
    },

    methods: {
        async fetchRequests() {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) return alert("Unauthorized: No token found.");

                const response = await fetch('/customer/service-requests', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': token }
                });

                if (response.ok) {
                    this.requests = await response.json();
                } else {
                    alert("Failed to fetch service requests.");
                }
            } catch (error) {
                console.error("Error fetching service requests:", error);
                alert("An error occurred while fetching service requests.");
            }
        },

        openEditModal(req) {
            this.selectedRequest = req;
            this.updatedDate = req.date_of_service;
        },

        async updateRequest() {
            if (!this.updatedDate) {
                alert("Please select a new service date.");
                return;
            }

            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) return alert("Unauthorized: No token found.");

                const response = await fetch(`/customer/service-requests/update/${this.selectedRequest.id}`, {
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': token },
                    body: JSON.stringify({ date_of_service: this.updatedDate })
                });

                if (response.ok) {
                    alert("Service date updated successfully.");
                    this.fetchRequests();
                    this.closeModal();
                } else {
                    alert("Failed to update service date.");
                }
            } catch (error) {
                console.error("Error updating service request:", error);
                alert("An error occurred while updating the service request.");
            }
        },

        confirmDelete(id) {
            if (confirm("Are you sure you want to delete this service request? This action cannot be undone.")) {
                this.deleteRequest(id);
            }
        },

        async deleteRequest(id) {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) return alert("Unauthorized: No token found.");

                const response = await fetch(`/customer/service-requests/delete/${id}`, {
                    method: "DELETE",
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': token }
                });

                if (response.ok) {
                    alert("Service request deleted successfully.");
                    this.fetchRequests();
                } else {
                    alert("Failed to delete service request.");
                }
            } catch (error) {
                console.error("Error deleting service request:", error);
                alert("An error occurred while deleting the service request.");
            }
        },

        openFeedback(req) {
            this.selectedFeedback = req;
        },

        async submitFeedback() {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) return alert("Unauthorized: No token found.");

                if (!this.feedback.rating || this.feedback.rating < 1 || this.feedback.rating > 5) {
                    alert("Please enter a valid rating between 1 and 5.");
                    return;
                }

                const response = await fetch(`/customer/service-requests/close/${this.selectedFeedback.id}`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': token },
                    body: JSON.stringify(this.feedback)
                });

                if (response.ok) {
                    alert("Feedback submitted successfully.");
                    this.fetchRequests();
                    this.closeModal();
                } else {
                    alert("Failed to submit feedback.");
                }
            } catch (error) {
                console.error("Error submitting feedback:", error);
                alert("An error occurred while submitting feedback.");
            }
        },

        closeModal() {
            this.selectedRequest = null;
            this.selectedFeedback = null;
            this.updatedDate = "";
            this.feedback = { rating: "", remarks: "" };
        }
    },

    mounted() {
        this.fetchRequests();
    }
};
