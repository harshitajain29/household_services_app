export default {
  template: `
      <div class="container d-flex justify-content-center align-items-center vh-100" 
           style="background: linear-gradient(135deg, #4567b7, #6495ed);">
          <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
              <h2 class="mb-3 text-primary">Admin Statistics Overview</h2>
              
              <div v-if="message" :class="'alert alert-' + category" role="alert">
                  {{ message }}
              </div>
              
              <!-- ✅ Stats Cards -->
              <div class="row">
                  <div class="col-md-4" v-for="(stat, key) in stats" :key="key">
                      <div class="card text-center">
                          <div class="card-body">
                              <h5 class="card-title">{{ stat.label }}</h5>
                              <p class="card-text">{{ stat.value }}</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <!-- 📊 Charts -->
              <div class="row mt-4">
                  <div class="col-md-6">
                      <h4 class="mb-3 text-primary">Service Professionals by Type</h4>
                      <canvas ref="serviceProfessionalsChart"></canvas>
                  </div>
                  <div class="col-md-6">
                      <h4 class="mb-3 text-primary">Service Requests by Type</h4>
                      <canvas ref="serviceRequestsChart"></canvas>
                  </div>
              </div>
          </div>
      </div>
  `,
  data() {
      return {
          stats: {
              totalUsers: { label: "Total Users", value: 0 },
              totalProfessionals: { label: "Service Professionals", value: 0 },
              totalCustomers: { label: "Customers", value: 0 },
              closedServices: { label: "Closed Services", value: 0 },
              blockedProfessionals: { label: "Blocked Professionals", value: 0 },
              blockedCustomers: { label: "Blocked Customers", value: 0 },
          },
          message: null,
          category: null,
          charts: {} // Store chart instances to destroy them if needed
      };
  },
  
  mounted() {
      this.fetchStats();
      this.fetchChartData(
          "/admin/service-professionals-by-type",
          "serviceProfessionalsChart",
          "No. of Professionals",
          "#57BC90"
      );
      this.fetchChartData(
          "/admin/service-requests-by-type",
          "serviceRequestsChart",
          "No. of Requests",
          "#77C9D4"
      );
  },
  
  methods: {
      async fetchStats() {
          try {
              const token = JSON.parse(localStorage.getItem('user')).token;
              if (!token) {
                  this.message = "Unauthorized: No token found.";
                  this.category = "danger";
                  return;
              }
              
              const response = await fetch("/admin/stats-overview", {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                      "Authentication-Token": `${token}`
                  }
              });
              
              if (!response.ok) {
                  const errorData = await response.json();
                  this.message = errorData.message || "Failed to fetch stats.";
                  this.category = "danger";
                  return;
              }
              
              const data = await response.json();
              this.stats.totalUsers.value = data.total_users;
              this.stats.totalProfessionals.value = data.total_service_professionals;
              this.stats.totalCustomers.value = data.total_customers;
              this.stats.closedServices.value = data.closed_services;
              this.stats.blockedProfessionals.value = data.blocked_professionals;
              this.stats.blockedCustomers.value = data.blocked_customers;
          } catch (error) {
              this.message = "An unexpected error occurred.";
              this.category = "danger";
          }
      },
      
      async fetchChartData(apiUrl, chartRef, chartLabel, bgColor) {
          try {
              const token = JSON.parse(localStorage.getItem('user')).token;
              if (!token) {
                  this.message = "Unauthorized: No token found.";
                  this.category = "danger";
                  return;
              }
              
              const response = await fetch(apiUrl, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                      "Authentication-Token": `${token}`
                  }
              });
              
              if (!response.ok) {
                  const errorData = await response.json();
                  this.message = errorData.message || `Failed to fetch ${chartLabel} data.`;
                  this.category = "danger";
                  return;
              }
              
              const data = await response.json();
              
              // Get chart reference
              this.$nextTick(() => {
                  const ctx = this.$refs[chartRef]?.getContext("2d");
                  if (!ctx) return;
                  
                  // Destroy previous chart instance if it exists
                  if (this.charts[chartRef]) {
                      this.charts[chartRef].destroy();
                  }
                  
                  // Create new Chart instance
                  this.charts[chartRef] = new Chart(ctx, {
                      type: "bar",
                      data: {
                          labels: data.labels,
                          datasets: [
                              {
                                  label: chartLabel,
                                  data: data.values,
                                  backgroundColor: bgColor,
                                  borderColor: "#015249",
                                  borderWidth: 1
                              }
                          ]
                      },
                      options: {
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: { y: { beginAtZero: true } }
                      }
                  });
              });
          } catch (error) {
              this.message = "An unexpected error occurred.";
              this.category = "danger";
          }
      }
  },
  
  beforeUnmount() {
      // Destroy charts to avoid memory leaks
      Object.values(this.charts).forEach(chart => {
          if (chart) chart.destroy();
      });
  }
};
