from flask import current_app as app, request, jsonify, render_template,Blueprint
from flask_security import auth_required, verify_password, hash_password, current_user
from flask import make_response
from backend.models import db, Users, Services, ServiceProfessionals, ServiceRequests, Roles
from datetime import datetime
from sqlalchemy import func
from celery.result import AsyncResult
import csv
import os
import io

@app.get('/get-celery-data/<id>')
def getData(id):
    result = AsyncResult(id)

    if result.ready():
        return {'result' : result.result},200
    else:
        return {'message' :'task not ready'}

cache = app.cache

@app.route('/')
def home():
    return render_template('index.html')

@app.get("/protected")
@auth_required()
def protected():
    return "<h1>Only accessible by authenticated users</h1>"

@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return {'time': str(datetime.now())}

@app.route('/login', methods=['POST'])
def login():
    """
    Login endpoint for users.
    Expects JSON data with 'email' and 'password'.
    Returns a JSON response with a token if successful, or an error message if not. """
    # Get the JSON data from the request
    data = request.get_json()
    email_id = data.get('email')
    pass_hash = data.get('password')

    if not email_id or not pass_hash:
        return jsonify({"message": "Invalid inputs"}), 400

    user = app.security.datastore.find_user(email_id=email_id)

    if not user:
        return jsonify({"message": "Invalid email"}), 404
    # Check if the user is active
    # 0: pending approval, -1: declined, 1: active
    if user.active == 0:
        return jsonify({"message": "Your account is pending approval by the admin."}), 403
    elif user.active == -1:
        return jsonify({"message": "Your account has been declined or you have been blocked by admin"}), 403

    if verify_password(pass_hash, user.pass_hash):
        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email_id,
            'role': user.roles[0].name,
            'id': user.id,
            'location': user.city
        })
    
    return jsonify({'message': 'Incorrect password'}), 400


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('fname')
    last_name = data.get('lname')
    city = data.get('location')
    email_id = data.get('email')
    pass_hash = data.get('password')
    role = data.get('role')
    # Validate inputs
    # Check if all required fields are present
    if not email_id or not pass_hash or role not in ['admin', 'Customer', 'Service Professional']:
        return jsonify({"message": "Invalid inputs"}), 400

    user = app.security.datastore.find_user(email_id=email_id)

    if user:
        return jsonify({"message": "User already exists"}), 409  # Conflict

    # Set active status based on role
    active_status = False if role == 'Service Professional' else True  

    try:
        user = app.security.datastore.create_user(
            email_id=email_id, 
            pass_hash=hash_password(pass_hash), 
            roles=[role],  
            active=active_status,
            city=city,
            first_name=first_name,
            last_name=last_name
        )

        db.session.add(user)
        db.session.commit()

        if role == 'Service Professional':
            service_id = data.get('serviceType')
            experience_in_years = data.get('experience')
            aadhar_number = data.get('aadharNumber')
            print("Service ID: ",service_id)
            print("Experience: ", experience_in_years)
            print("Aadhar Number: ", aadhar_number)

            if not service_id or not experience_in_years or not aadhar_number:
                return jsonify({"message": "Invalid inputs"}), 400

            service_professional = ServiceProfessionals(
                user_id=user.id,
                experience_in_years=experience_in_years,
                service_id=service_id,
                aadhar_number=aadhar_number,
                average_rating=0.0,
                feedbacks_received=0,
                clients_till_date=0
            )
            db.session.add(service_professional)
            db.session.commit()
        
        return jsonify({"message": "User created"}), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())  
        return jsonify({"message": "Error creating user", "error": str(e)}), 500


@app.route('/createservice', methods=['POST'])
@auth_required('token')
def createservice():
    data = request.get_json()
    service_name = data.get('name')
    service_details = data.get('description')
    duration_estimate = data.get('min_time_required')
    required_payment = data.get('base_payment')

    if not all([service_name, service_details, duration_estimate, required_payment]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        duration_estimate = int(duration_estimate)
        required_payment = float(required_payment)
    except ValueError:
        return jsonify({"message": "Invalid numeric values"}), 400

    try:
        service = Services(
            service_name=service_name,
            service_details=service_details,
            duration_estimate=duration_estimate,
            required_payment=required_payment,
        )
        db.session.add(service)
        db.session.commit()

        return jsonify({"message": "Service created successfully", "service_id": service.id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Server error", "error": str(e)}), 500


@app.route('/api/services', methods=['GET'])
def get_services():
    try:
        services = Services.query.all()
        return jsonify([
            {'id': s.id, 'name': s.service_name, 'description': s.service_details, 'base_payment': s.required_payment}
            for s in services
        ]), 200
    except Exception as e:
        return jsonify({"message": "Error fetching services", "error": str(e)}), 500


@app.route('/api/service-professionals', methods=['GET'])
def get_service_professionals():
    try:
        service_pros = db.session.query(
            Users.first_name,
            Users.last_name,    
            Users.city,
            ServiceProfessionals.experience_in_years,
            ServiceProfessionals.aadhar_number,
            Services.service_name.label("service_name"),
            Users.active,
            Users.id.label("user_id")
        ).join(Users, Users.id == ServiceProfessionals.user_id) \
         .join(Services, Services.id == ServiceProfessionals.service_id).all()

        professionals_list = [
            {
                "name": f"{sp.first_name} {sp.last_name}",
                "location": sp.city,
                "service": sp.service_name,
                "experience": sp.experience_in_years,
                "aadhar_number": sp.aadhar_number,
                "status": int(sp.active),
                "user_id": sp.user_id
            }
            for sp in service_pros
        ]

        return jsonify(professionals_list), 200
    except Exception as e:
        return jsonify({"message": "Error fetching professionals", "error": str(e)}), 500



@app.route('/api/service-professionals/<int:user_id>/update-status', methods=['POST'])
def update_service_professional_status(user_id):
    try:
        data = request.get_json()
        new_status = data.get("status")

        if new_status not in [1, -1]:  
            return jsonify({"message": "Invalid status"}), 400

        user = Users.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        user.active = new_status
        db.session.commit()

        return jsonify({"message": "Status updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating status", "error": str(e)}), 500


@app.route('/api/service-professionals/filter', methods=['GET'])
def get_filtered_service_professionals():
    try:
        service_id = request.args.get('service_id')
        location = request.args.get('location')
        print(service_id, location)

        if not service_id or not location:
            return jsonify({"message": "Missing required parameters"}), 400

        professionals = db.session.query(
            Users.first_name, Users.last_name, ServiceProfessionals.experience_in_years,
            Services.service_name, Services.required_payment, Users.id.label("user_id"),
            ServiceProfessionals.average_rating
        ).join(Users, Users.id == ServiceProfessionals.user_id) \
         .join(Services, Services.id == ServiceProfessionals.service_id) \
         .filter(ServiceProfessionals.service_id == service_id, Users.city == location, Users.active == 1) \
         .all()

        return jsonify([
            {
                "name": f"{sp.first_name} {sp.last_name}",
                "experience": sp.experience_in_years,
                "price": sp.required_payment,
                "service": sp.service_name,
                "user_id": sp.user_id,
                "rating": sp.average_rating
            }
            for sp in professionals
        ]), 200
    except Exception as e:
        return jsonify({"message": "Error fetching professionals", "error": str(e)}), 500


@app.route('/api/book-service', methods=['POST'])
def book_service():
    try:
        data = request.get_json()
        print("📥 Received booking request:", data)  # ✅ Debugging

        customer_id = data.get('customer_id')
        professional_id = data.get('professional_id')
        service_id = data.get('service_id')
        service_date = data.get('service_date')

        if not all([customer_id, professional_id, service_id, service_date]):
            return jsonify({"message": "Missing required fields"}), 400

        new_request = ServiceRequests(
            customer_id=customer_id,
            service_professional_id=professional_id,
            service_id=service_id,
            service_date=datetime.strptime(service_date, "%Y-%m-%d"),
            service_status="requested"
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({"message": "Service booked successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print("❌ Error:", str(e))  # ✅ Print error for debugging
        return jsonify({"message": "Error booking service", "error": str(e)}), 500




@app.route("/customer/service-requests", methods=["GET"])
@auth_required('token')
def get_customer_requests():
    try:
        # Fetch service requests with service professionals and services
        requests = (
            db.session.query(
                ServiceRequests.id,
                Users.first_name,
                Users.last_name,
                Services.service_name,
                Services.service_details,
                Services.required_payment,
                ServiceRequests.request_date,
                ServiceRequests.service_date,
                ServiceRequests.service_status,
                ServiceRequests.rating,
                ServiceRequests.feedback
            )
            .join(Services, ServiceRequests.service_id == Services.id)  # Join with Service table
            .outerjoin(Users, ServiceRequests.service_professional_id == Users.id)  # Left Join with Service Professional
            .filter(ServiceRequests.customer_id == current_user.id)  # Filter by logged-in customer
            .all()
        )

        # Convert data into JSON-friendly format
        data = [
            {
                "id": req.id,
                "professional_name": f"{req.first_name or ''} {req.last_name or ''}".strip() if req.first_name else "N/A",
                "service_name": req.service_name,
                "description": req.service_details,
                "base_payment": req.required_payment,
                "date_of_request": req.request_date.strftime("%Y-%m-%d"),
                "date_of_service": req.service_date.strftime("%Y-%m-%d") if req.service_date else "Not Assigned",
                "status": req.service_status,
                "rating": req.rating if req.rating else "No Ratings",
                "remarks": req.feedback if req.feedback else "No Feedbacks",
            }
            for req in requests
        ]

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch service requests", "message": str(e)}), 500



@app.route("/professional/service-requests", methods=["GET"])
@auth_required('token')
def get_professional_requests():
    try:
        print(f"Fetching requests for service_professional_id={current_user.id}")  # Debugging

        requests = (
            db.session.query(ServiceRequests, Users)
            .join(Users, ServiceRequests.customer_id == Users.id)
            .filter(ServiceRequests.service_professional_id == current_user.id)
            .all()
        )

        if not requests:
            print("No requests found!")  # Debugging

        data = [
            {
                "id": req.ServiceRequests.id,
                "customer_name": f"{req.Users.first_name} {req.Users.last_name}",
                "date_of_request": req.ServiceRequests.request_date.strftime("%Y-%m-%d"),
                "date_of_service": (
                    req.ServiceRequests.service_date.strftime("%Y-%m-%d")
                    if req.ServiceRequests.service_date
                    else "N/A"
                ),
                "status": req.ServiceRequests.service_status,
            }
            for req in requests
        ]

        return jsonify(data), 200

    except Exception as e:
        print(f"Error fetching service requests: {str(e)}")  # Debugging
        return jsonify({"error": "Internal Server Error"}), 500



# Accept a service request
@app.route("/professional/service-requests/accept/<int:request_id>", methods=["POST"])
@auth_required('token')
def accept_request(request_id):
    service_request = ServiceRequests.query.get_or_404(request_id)
    if service_request.service_professional_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "assigned"
    db.session.commit()
    return jsonify({"message": "Service request accepted."})

# Reject a service request
@app.route("/professional/service-requests/reject/<int:request_id>", methods=["POST"])
@auth_required('token')
def reject_request(request_id):
    service_request = ServiceRequests.query.get_or_404(request_id)
    if service_request.service_professional_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "rejected"
    db.session.commit()
    return jsonify({"message": "Service request rejected."})

# Mark service as completed
@app.route("/professional/service-requests/complete/<int:request_id>", methods=["POST"])
@auth_required('token')
def complete_request(request_id):
    service_request = ServiceRequests.query.get_or_404(request_id)
    if service_request.service_professional_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "completed"
    db.session.commit()
    return jsonify({"message": "Service request marked as completed."})

# Close service request with feedback
@app.route("/customer/service-requests/close/<int:request_id>", methods=["POST"])
@auth_required('token')
def close_request(request_id):
    data = request.get_json()
    rating = int(data.get("rating"))
    feedback = data.get("remarks")

    if not (1 <= rating <= 5) or not feedback:
        return jsonify({"error": "Invalid rating or missing feedback"}), 400

    service_request = ServiceRequests.query.get_or_404(request_id)
    if service_request.customer_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "closed"
    service_request.rating = rating
    service_request.feedback = feedback

    professional = ServiceProfessionals.query.filter_by(user_id=service_request.service_professional_id).first()
    if professional:
        professional.feedbacks_received += 1
        professional.clients_till_date += 1

        total_ratings = db.session.query(
            db.func.sum(ServiceRequests.rating)
        ).filter(
            ServiceRequests.service_professional_id == service_request.service_professional_id, 
            ServiceRequests.rating.isnot(None)
        ).scalar()

        total_reviews = ServiceRequests.query.filter(
            ServiceRequests.service_professional_id == service_request.service_professional_id, 
            ServiceRequests.rating.isnot(None)
        ).count()

        professional.average_rating = total_ratings / total_reviews if total_reviews > 0 else 0.0

    db.session.commit()
    return jsonify({"message": "Service closed and feedback recorded."})

# Get all services
@app.route("/admin/services", methods=["GET"])
@auth_required('token')
def get_services_admin():
    services = Services.query.all()
    return jsonify([{
        "id": s.id,
        "name": s.service_name,
        "description": s.service_details,
        "base_payment": s.required_payment,
        "min_time": s.duration_estimate
    } for s in services])

# Update a service
@app.route("/admin/services/<int:service_id>", methods=["PUT"])
@auth_required('token')
def update_service(service_id):
    data = request.json
    service = Services.query.get_or_404(service_id)

    service.service_name = data.get("name", service.service_name)
    service.service_details = data.get("description", service.service_details)
    service.required_payment = data.get("base_payment", service.required_payment)
    service.duration_estimate = data.get("min_time", service.duration_estimate)

    db.session.commit()
    return jsonify({"message": "Service updated successfully."})

# Delete a service
@app.route("/admin/services/<int:service_id>", methods=["DELETE"])
@auth_required('token')
def delete_service(service_id):
    service = Services.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted successfully."})

# Update service request (only service date)
@app.route("/customer/service-requests/update/<int:req_id>", methods=["PUT"])
@auth_required('token')
def update_service_request(req_id):
    try:
        data = request.get_json()
        new_service_date = data.get("date_of_service")

        if not new_service_date:
            return jsonify({"error": "Service date is required"}), 400

        try:
            new_service_date = datetime.strptime(new_service_date, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        req = ServiceRequests.query.filter_by(id=req_id, customer_id=current_user.id).first()

        if not req:
            return jsonify({"error": "Service request not found"}), 404

        if req.service_status != "requested":
            return jsonify({"error": "Only requested service requests can be updated"}), 403

        req.service_date = new_service_date
        db.session.commit()

        return jsonify({"message": "Service date updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": "Failed to update service request", "message": str(e)}), 500

# Delete service request
@app.route("/customer/service-requests/delete/<int:req_id>", methods=["DELETE"])
@auth_required('token')
def delete_service_request(req_id):
    try:
        req = ServiceRequests.query.filter_by(id=req_id, customer_id=current_user.id).first()

        if not req:
            return jsonify({"error": "Service request not found"}), 404

        if req.service_status != "requested":
            return jsonify({"error": "Only requested service requests can be deleted"}), 403

        db.session.delete(req)
        db.session.commit()

        return jsonify({"message": "Service request deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": "Failed to delete service request", "message": str(e)}), 500
\

@app.route('/admin/customers', methods=['GET'])
def get_customers():
    customer_role = Roles.query.filter_by(name='Customer').first()
    customers = Users.query.filter(Users.roles.contains(customer_role)).all()
    return jsonify([{'id': customer.id, 'email': customer.email_id, 'fname': customer.first_name, 'lname': customer.last_name, 'location': customer.city, 'active': customer.active} for customer in customers])

@app.route('/admin/professionals', methods=['GET'])
def get_professionals():
    professional_role = Roles.query.filter_by(name='Service Professional').first()
    professionals = Users.query.filter(Users.roles.contains(professional_role)).all()
    return jsonify([{'id': professional.id, 'email': professional.email_id, 'fname': professional.first_name, 'lname': professional.last_name, 'location': professional.city, 'active': professional.active} for professional in professionals])

@app.route('/api/block-user/<int:user_id>', methods=['POST'])
def block_user(user_id):
    user = Users.query.get(user_id)
    if user:
        user.active = -1
        db.session.commit()
        
        # Delete associated ServiceRequests
        ServiceRequests.query.filter(
            (ServiceRequests.customer_id == user_id) | (ServiceRequests.service_professional_id == user_id),
            ServiceRequests.service_status.in_(['requested', 'assigned'])
        ).delete()
        db.session.commit()
        
        return jsonify({'message': 'User blocked successfully'})
    else:
        return jsonify({'message': 'User not found'}), 404

@app.route('/api/unblock-user/<int:user_id>', methods=['POST'])
def unblock_user(user_id):
    user = Users.query.get(user_id)
    user.active = 1
    db.session.commit()
    return jsonify({'message': 'User unblocked successfully'})

    # 🟢 Ensure Only Admins Can Access Stats
def is_admin():
    return any(role.name == "admin" for role in current_user.roles)


@app.route("/admin/stats-overview", methods=["GET"])
@auth_required('token')
def admin_stats_overview():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    try:
        stats = {
            "total_users": Users.query.count(),
            "total_service_professionals": ServiceProfessionals.query.count(),
            "total_customers": Users.query.filter(Users.roles.any(name="Customer")).count(),
            "closed_services": ServiceRequests.query.filter_by(service_status="closed").count(),
            "blocked_professionals": Users.query.filter_by(active=-1).count(),
            "blocked_customers": Users.query.filter(Users.roles.any(name="Customer"), Users.active == -1).count()
        }

        return jsonify(stats), 200

    except Exception as e:
        return jsonify({"message": "Error fetching stats", "error": str(e)}), 500

# 📊 **Bar Chart: No. of Service Professionals by Type**
@app.route("/admin/service-professionals-by-type", methods=["GET"])
@auth_required('token')  # Requires authentication via token
def service_professionals_by_type():
    try:
        results = (
            db.session.query(Services.service_name, func.count(ServiceProfessionals.id))
            .join(ServiceProfessionals, Services.id == ServiceProfessionals.service_id)
            .group_by(Services.service_name)
            .all()
        )

        data = {
            "labels": [row[0] for row in results],  # Service Names
            "values": [row[1] for row in results]   # Count of Professionals per Service
        }

        return jsonify(data), 200

    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return jsonify({"message": "Error fetching data", "error": str(e)}), 500

@app.route("/admin/service-requests-by-type", methods=["GET"])
@auth_required('token')  # Requires authentication via token
def service_requests_by_type():
    try:
        result = (
            db.session.query(Services.service_name, func.count(ServiceRequests.id))
            .join(ServiceRequests, Services.id == ServiceRequests.service_id)
            .group_by(Services.service_name)
            .all()
        )

        data = {
            "labels": [row[0] for row in result],  # Service Names
            "values": [row[1] for row in result]   # Count of Requests per Service
        }

        return jsonify(data), 200

    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return jsonify({"message": "Error fetching data", "error": str(e)}), 500

@app.route('/api/locations', methods=['GET'])
def get_locations():
    locations = db.session.query(Users.city).distinct().all()
    return jsonify([location[0] for location in locations])

@app.route('/export-data')
def export_data():
    # if not current_user.is_authenticated:
    #     return redirect(url_for('login'))

    # if current_user.role != 'admin':
    #     return {'message': 'Admin access required.'}, 401

    service_requests = ServiceRequests.query.all()
    reqdata = [{
        'id': req.id,
        'service_id': req.service_id,
        'customer_id': req.customer_id,
        'service_professional_id': req.service_professional_id,
        'status': req.service_status,
        'rating': req.rating,
        'feedback': req.feedback
    } for req in service_requests]

    si = io.StringIO()
    fieldnames = ['id', 'service_id', 'customer_id', 'service_professional_id', 'status', 'rating', 'feedback']
    writer = csv.DictWriter(si, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(reqdata)
    output = si.getvalue()

    response = make_response(output)
    response.headers['Content-Disposition'] = 'attachment; filename=service_requests.csv'
    response.headers['Content-Type'] = 'text/csv'
    return response

def is_professional():
    return any(role.name == "Service Professional" for role in current_user.roles)

@app.route("/professional-dashboard", methods=["GET"])
@auth_required('token')
def professional_stats_overview():
    if not is_professional():
        return jsonify({"error": "Unauthorized"}), 403

    try:
        professional_id = current_user.id  # Logged-in professional ID

        stats = {
            "total_requests": ServiceRequests.query.filter_by(service_professional_id=professional_id).count(),
            "pending_requests": ServiceRequests.query.filter_by(service_professional_id=professional_id, service_status="requested").count(),
            "accepted_requests": ServiceRequests.query.filter_by(service_professional_id=professional_id, service_status="assigned").count(),
            "completed_requests": ServiceRequests.query.filter_by(service_professional_id=professional_id, service_status="completed").count(),
            "closed_requests": ServiceRequests.query.filter_by(service_professional_id=professional_id, service_status="closed").count(),
            "avg_rating": round(
                db.session.query(func.avg(ServiceRequests.rating))
                .filter_by(service_professional_id=professional_id)
                .scalar() or 0, 1),  # Default to 0 if no ratings exist
            "past_clients": db.session.query(ServiceRequests.customer_id)
                .filter_by(service_professional_id=professional_id)
                .distinct()
                .count()
        }

        return jsonify(stats), 200

    except Exception as e:
        return jsonify({"message": "Error fetching stats", "error": str(e)}), 500