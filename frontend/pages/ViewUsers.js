export default {
  template: `
    <div class="container d-flex justify-content-center align-items-center vh-100" 
         style="background: linear-gradient(135deg, #4567b7, #6495ed);">
      <div class="card p-4 shadow-lg text-center" style="width: 800px; border-radius: 10px;">
        <h2 class="mb-3 text-primary">Manage Users</h2>
        <div class="tabs">
          <button class="tab btn btn-primary" :class="{ active: tab === 'customers' }" @click="tab = 'customers'">Customers</button>
          <button class="tab btn btn-primary" :class="{ active: tab === 'professionals' }" @click="tab = 'professionals'">Professionals</button>
        </div>
        <div class="form-group mb-3">
          <input type="text" v-model="searchKeyword" class="form-control" placeholder="Search by name...">
        </div>
        <div class="form-group mb-3">
          <select v-model="locationFilter" class="form-control">
            <option value="">All locations</option>
            <option v-for="location in locations" :key="location">{{ location }}</option>
          </select>
        </div>
        <div class="table-container">
          <table class="table table-bordered">
            <thead class="thead-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Take Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.fname }} {{ user.lname }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.location }}</td>
                <td>
                  <button v-if="user.active === 1" class="btn btn-danger btn-sm" @click="blockUser(user.id)">Block</button>
                  <button v-else class="btn btn-success btn-sm" @click="unblockUser(user.id)">Unblock</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      tab: "customers",
      customers: [],
      professionals: [],
      searchKeyword: "",
      locationFilter: "",
      locations: []
    };
  },
  computed: {
    filteredUsers() {
      let users = this.tab === "customers" ? this.customers : this.professionals;
      if (this.searchKeyword) {
        users = users.filter(user => {
          return (user.fname + " " + user.lname).toLowerCase().includes(this.searchKeyword.toLowerCase());
        });
      }
      if (this.locationFilter) {
        users = users.filter(user => user.location === this.locationFilter);
      }
      return users;
    }
  },
  mounted() {
    this.getCustomers();
    this.getProfessionals();
    this.getLocations();
  },
  methods: {
    getCustomers() {
      fetch("/admin/customers")
        .then(response => response.json())
        .then(data => this.customers = data)
        .catch(error => console.error("Error fetching customers:", error));
    },
    getProfessionals() {
      fetch("/admin/professionals")
        .then(response => response.json())
        .then(data => this.professionals = data)
        .catch(error => console.error("Error fetching professionals:", error));
    },
    getLocations() {
      fetch("/api/locations")
        .then(response => response.json())
        .then(data => this.locations = data)
        .catch(error => console.error("Error fetching locations:", error));
    },
    blockUser(id) {
      fetch(`/api/block-user/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(() => {
          let user = this.filteredUsers.find(user => user.id === id);
          if (user) user.active = 0;
        })
        .catch(error => console.error("Error blocking user:", error));
    },
    unblockUser(id) {
      fetch(`/api/unblock-user/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(() => {
          let user = this.filteredUsers.find(user => user.id === id);
          if (user) user.active = 1;
        })
        .catch(error => console.error("Error unblocking user:", error));
    }
  }
};
