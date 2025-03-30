import store from "../utils/store.js";

export default {
    template: `
    <div class="container d-flex justify-content-center align-items-center vh-100" 
         style="background: linear-gradient(135deg, #4567b7, #6495ed);">
        <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
            <h2 class="mb-3 text-primary">Available Professionals</h2>

            <table class="table table-striped text-center">
                <thead class="thead-dark">
                    <tr>
                        <th>Name</th>
                        <th>Experience</th>
                        <th>Avg Rating</th>
                        <th>Price</th>
                        <th>Schedule</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="pro in professionals" :key="pro.user_id">
                        <td>{{ pro.name }}</td>
                        <td>{{ pro.experience }} years</td>
                        <td>{{ pro.average_rating|| "N/A" }}</td>
                        <td>₹{{ pro.price }}</td>
                        <td>
                            <button class="btn" 
                                    style="background-color: #6495ed; color: white;"
                                    @click="openModal(pro.user_id)">
                                Schedule
                            </button>
                        </td>
                    </tr>
                    <tr v-if="professionals.length === 0">
                        <td colspan="5" class="text-center text-muted">No professionals found.</td>
                    </tr>
                </tbody>
            </table>

            <!-- 📌 Booking Modal -->
            <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content rounded">
                        <div class="modal-header">
                            <h5 class="modal-title text-dark">Select Service Date</h5>
                            <button type="button" class="close" @click="closeModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <label for="serviceDate" class="text-dark">Choose Date:</label>
                            <input type="date" id="serviceDate" v-model="selectedDate" 
                                   class="form-control" required>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                            <button type="button" class="btn" 
                                    style="background-color: #57BC90; color: white;" 
                                    @click="scheduleService">
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showModal" class="modal-backdrop fade show"></div> 
        </div>
    </div>
    `,

    data() {
        return { 
            professionals: [],
            showModal: false,
            selectedDate: "",
            selectedProfessional: null,
        };
    },

    mounted() {
        this.fetchProfessionals();
    },

    methods: {
        async fetchProfessionals() {
            const service_id = this.$route.query.service_id;
            const user_location = store.state.location || "";
            console.log("🔍 Fetching professionals for:", { service_id, user_location });

            if (!service_id) {
                alert("Service ID is missing!");
                return;
            }

            try {
                const response = await fetch(`/api/service-professionals/filter?service_id=${service_id}&location=${encodeURIComponent(user_location)}`);
                const data = await response.json();
                this.professionals = data;
            } catch (error) {
                console.error("❌ Error fetching professionals:", error);
            }
        }, 

        openModal(professionalId) {
            this.selectedProfessional = professionalId;
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.selectedDate = "";
            this.selectedProfessional = null;
        },

        async scheduleService() {
            if (!this.selectedDate) {
                alert("Please select a date!");
                return;
            }

            const customerId = store.state.user_id;
            if (!customerId) {
                alert("You must be logged in to book a service.");
                return;
            }

            try {
                const response = await fetch("/api/book-service", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customer_id: customerId,
                        professional_id: this.selectedProfessional,
                        service_id: this.$route.query.service_id,
                        service_date: this.selectedDate
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to book service.");
                }

                const result = await response.json();
                alert(result.message);
                this.closeModal();
            } catch (error) {
                console.error("❌ Error booking service:", error);
            }
        }
    }
};