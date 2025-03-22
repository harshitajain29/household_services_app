export default {
    template: `
        <div>
            <h1>Welcome Admin</h1>
            <button class="btn btn-primary" @click="createServiceForm">Create Service</button>
        </div>
    `,
    methods: {
        createServiceForm() {
            console.log("Inside create service form")
            this.$router.push({ name: 'create-service' })
        }
    }
}