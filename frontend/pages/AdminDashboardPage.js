export default {
  template: `
    <div class="admin-dashboard d-flex align-items-center justify-content-center vh-100" 
         style="background: linear-gradient(135deg, #4567b7, #6495ed);">
      <div class="card p-4 shadow-lg text-center" style="width: 400px; border-radius: 10px;">
        <div class="card-body">
          <h2 class="mb-4 text-primary">Admin Dashboard</h2>
          
          <button class="btn btn-primary w-100 mb-3" @click="goToCreateService">
            Create a Service
          </button>
          <button class="btn btn-primary w-100 mb-3" @click="goToServiceProfessionals">
            View Service Professionals
          </button>
          <button class="btn btn-primary w-100 mb-3" @click="goToServiceTable">
            View Services
          </button>
          <button class="btn btn-primary w-100 mb-3" @click="goToViewUsers">
            View Users
          </button>
          <button class="btn btn-primary w-100 mb-3" @click="goToViewStats">
            View Stats
          </button>
          <a class="btn btn-primary w-100 mb-3" href="/export-data">
            Export Data
          </a>
        </div>
      </div>
    </div>
  `,
  methods: {
    goToCreateService() {
      this.$router.push('/createservice');
    },
    goToServiceProfessionals() {
      this.$router.push('/service-professionals');
    },
    goToServiceTable(){
      this.$router.push('/admin/services')
    },
    goToViewUsers() {
      this.$router.push('/admin/users')
    },
    goToViewStats() {
      this.$router.push('/admin/stats-overview')
    }
    // async exportData() {
    //   try {
    //     const token = localStorage.getItem("token");
    //     if (!token) {
    //       alert("Authentication token not found. Please log in again.");
    //       this.$router.push("/login");
    //       return;
    //     }
    
    //     alert("Initiating data export... Please wait.");
    
        
    //     const response = await fetch('/export_data', { 
    //       headers: { 'Content-Type': 'application/json', 'Authentication-Token': token },
    //       responseType: 'blob'
    //     });
    
        
    //     const url = window.URL.createObjectURL(new Blob([response.data]));
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', 'service_requests.csv');
    //     document.body.appendChild(link);
    //     link.click();
    //     // Clean up
    //     window.URL.revokeObjectURL(url);
    //     document.body.removeChild(link);
    //   } catch (error) {
    //     console.error("Error exporting data:", error);
    //     alert("Failed to export data. Please try again.");
    //   }
    // }
    }
  };
