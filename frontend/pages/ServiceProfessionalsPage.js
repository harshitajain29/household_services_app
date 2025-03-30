export default {
  template: `
    <div class="container d-flex justify-content-center align-items-center vh-100" 
         style="background: linear-gradient(135deg, #4567b7, #6495ed);">
      <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
        <h2 class="mb-3 text-primary">Service Professionals</h2>
        <table class="table table-bordered">
          <thead class="thead-dark">
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Service</th>
              <th>Experience (Years)</th>
              <th>PAN Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="professional in professionals" :key="professional.user_id">
              <td>{{ professional.name }}</td>
              <td>{{ professional.location }}</td>
              <td>{{ professional.service }}</td>
              <td>{{ professional.experience }}</td>
              <td>{{ professional.aadhar_number }}</td>
              <td>
                <span v-if="professional.status === 1" class="badge badge-success">Approved</span>
                <span v-else-if="professional.status === -1" class="badge badge-danger">Blocked</span>
                <span v-else class="badge badge-warning">Pending</span>
              </td>
              <td>
                <button v-if="professional.status === 0" @click="updateStatus(professional.user_id, 1)" class="btn btn-success btn-sm">
                  Approve
                </button>
                <button v-if="professional.status === 0" @click="updateStatus(professional.user_id, -1)" class="btn btn-danger btn-sm ml-2">
                  Block
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data() {
    return {
      professionals: []
    };
  },
  methods: {
    async fetchProfessionals() {
      try {
        const response = await fetch("/api/service-professionals");
        const data = await response.json();
        this.professionals = data;
      } catch (error) {
        console.error("Error fetching professionals:", error);
      }
    },
    async updateStatus(userId, status) {
      try {
        await fetch(`/api/service-professionals/${userId}/update-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
        this.fetchProfessionals(); // Refresh list after update
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  },
  mounted() {
    this.fetchProfessionals();
  }
};
