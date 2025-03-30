export default {
    template: `
        <div class="container d-flex justify-content-center align-items-center vh-100" 
             style="background: linear-gradient(135deg, #4567b7, #6495ed);">
            <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
                <h2 class="mb-3 text-primary">My Service Requests</h2>

                <table class="table table-striped text-center">
                    <thead class="thead-dark">
                        <tr>
                            <th>Customer</th>
                            <th>Requested On</th>
                            <th>Service Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="req in requests" :key="req.id">
                            <td>{{ req.customer_name }}</td>
                            <td>{{ req.date_of_request }}</td>
                            <td>{{ req.date_of_service }}</td>
                            <td>{{ req.status }}</td>
                            <td>
                                <button v-if="req.status === 'requested'" class="btn btn-success btn-sm" @click="acceptRequest(req.id)">Accept</button>
                                <button v-if="req.status === 'requested'" class="btn btn-danger btn-sm" @click="rejectRequest(req.id)">Reject</button>
                                <button v-if="req.status === 'assigned'" class="btn btn-primary btn-sm" @click="confirmComplete(req.id)">Mark as Completed</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Confirmation Modal -->
                <div v-if="confirmingRequest" class="modal fade show d-block">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Confirm Completion</h5>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>
                            <div class="modal-body">
                                <p>Are you sure you want to mark this service as completed?</p>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary" @click="closeModal">Cancel</button>
                                <button class="btn btn-primary" @click="completeRequest">Yes, Complete</button>
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
            confirmingRequest: null
        };
    },
    methods: {
        getToken() {
            const user = JSON.parse(localStorage.getItem('user'));
            return user ? user.token : null;
        },
        async fetchRequests() {
            const token = this.getToken();
            if (!token) {
                console.error("Unauthorized: No token found.");
                return;
            }

            try {
                const response = await fetch("/professional/service-requests", {
                    method: "GET",
                    headers: {
                        'Authentication-Token': token
                    }
                });

                if (response.ok) {
                    this.requests = await response.json();
                } else {
                    console.error("Error fetching requests:", await response.text());
                }
            } catch (error) {
                console.error("Network error:", error);
            }
        },
        async acceptRequest(id) {
            await this.updateRequestStatus(`/professional/service-requests/accept/${id}`, "POST");
        },
        async rejectRequest(id) {
            await this.updateRequestStatus(`/professional/service-requests/reject/${id}`, "POST");
        },
        confirmComplete(id) {
            this.confirmingRequest = id;
        },
        async completeRequest() {
            await this.updateRequestStatus(`/professional/service-requests/complete/${this.confirmingRequest}`, "POST");
            this.closeModal();
        },
        closeModal() {
            this.confirmingRequest = null;
        },
        async updateRequestStatus(url, method) {
            const token = this.getToken();
            if (!token) {
                console.error("Unauthorized: No token found.");
                return;
            }

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authentication-Token': token
                    }
                });

                if (response.ok) {
                    this.fetchRequests();
                } else {
                    console.error("Error updating request status:", await response.text());
                }
            } catch (error) {
                console.error("Network error:", error);
            }
        }
    },
    mounted() {
        this.fetchRequests();
    }
};
