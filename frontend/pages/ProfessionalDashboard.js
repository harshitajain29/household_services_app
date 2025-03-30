export default {
    data() {
      return {
        stats: {
          totalRequests: { label: "Total Service Requests", value: 0, icon: "fas fa-list", color: "#57BC90" },
          pendingRequests: { label: "Pending Requests", value: 0, icon: "fas fa-clock", color: "#F4A261" },
          acceptedRequests: { label: "Accepted Requests", value: 0, icon: "fas fa-handshake", color: "#2A9D8F" },
          completedRequests: { label: "Completed Requests", value: 0, icon: "fas fa-check-circle", color: "#264653" },
          closedRequests: { label: "Closed Requests", value: 0, icon: "fas fa-lock", color: "#6A0572" },
          avgRating: { label: "Average Rating", value: 0, icon: "fas fa-star", color: "#F4D35E" },
          pastClients: { label: "Past Clients", value: 0, icon: "fas fa-users", color: "#8A89C0" },
        },
        message: null,
        category: null
      };
    },
  
    mounted() {
      this.fetchStats();
    },
  
    methods: {
      async fetchStats() {
        try {
          const token = JSON.parse(localStorage.getItem("user"))?.token;
          if (!token) {
            this.message = "Unauthorized: No token found.";
            this.category = "danger";
            return;
          }
  
          const response = await fetch("/professional-dashboard", {
            method: "GET",
            headers: { "Content-Type": "application/json", "Authentication-Token": `${token}` }
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            this.message = errorData.message || "Failed to fetch stats.";
            this.category = "danger";
            return;
          }
  
          const data = await response.json();
          this.stats.totalRequests.value = data.total_requests;
          this.stats.pendingRequests.value = data.pending_requests;
          this.stats.acceptedRequests.value = data.accepted_requests;
          this.stats.completedRequests.value = data.completed_requests;
          this.stats.closedRequests.value = data.closed_requests;
          this.stats.avgRating.value = data.avg_rating.toFixed(1);
          this.stats.pastClients.value = data.past_clients;
        } catch (error) {
          this.message = "An unexpected error occurred.";
          this.category = "danger";
        }
      }
    },
  
    template: `
      <div class="container d-flex justify-content-center align-items-center vh-100" 
           style="background: linear-gradient(135deg, #4567b7, #6495ed);">
        <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
          <h3 class="mb-3 text-primary">Service Professional Stats</h3>
  
          <div v-if="message" :class="'alert alert-' + category" role="alert">
            {{ message }}
          </div>
  
          <!-- ✅ Stats Cards -->
          <div class="row mt-3">
            <div class="col-lg-4 col-md-6 mb-4" v-for="(stat, key) in stats" :key="key">
              <div class="card shadow-sm border-0 rounded-lg text-center p-3" :style="{ backgroundColor: stat.color, color: '#fff' }">
                <div class="card-body">
                  <i :class="stat.icon + ' fa-3x mb-2'"></i>
                  <h5 class="card-title">{{ stat.label }}</h5>
                  <p class="card-text fs-4 fw-bold">{{ stat.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  };
