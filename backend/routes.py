from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, verify_password, hash_password, current_user
from backend.models import db, User, Service, CustomerProfile, ProfessionalProfile
datastore = app.security.datastore

@app.get('/')
def home():
    return render_template('index.html')

@app.get('/protected')
@auth_required
def protected():
    return '<h1> Only accessible by auth user </h1>'

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email') 
    password = data.get('password')

    if not email or not password:
        return jsonify({"message" : "invalid inputs"}), 404
    
    user = datastore.find_user(email = email)

    if not user:
        return jsonify({"message": "invalid email"}), 404

    if verify_password(password, user.password):
        if user.roles[0].name == 'admin':
            return jsonify({'token': user.get_auth_token(), 'email': user.email, 'role': user.roles[0].name, 'id': user.id, 'redirect': '/admin-dashboard'})
        else:
            return jsonify({'token': user.get_auth_token(), 'email': user.email, 'role': user.roles[0].name, 'id': user.id})
    
    return jsonify({"message": "password wrong"}), 400

# @app.route('/register', methods=['POST'])

# def register():
#     data = request.get_json()
#     email = data.get('email') #wont give error if not found
#     password = data.get('password')
#     role = data.get('role')

#     if not email or not password or role not in ['admin', 'user']:
#         return jsonify({"message": "invalid inputs"}), 404
    
#     try:
#         datastore.create_user(email=email, password=hash_password(password), roles = [role], active = True)
#         db.session.commit()
#         return jsonify({"message": "user created"}), 200
#     except:
#         db.session.rollback()
#         return jsonify({"message": "error creating user"}), 400
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    fname = data.get('fname')
    lname = data.get('lname')
    location = data.get('location')

    if not email or not password or role not in ['admin', 'Customer', 'Service Professional']:
        return jsonify({"message": "Invalid inputs"}), 400

    user = app.security.datastore.find_user(email=email)

    if user:
        return jsonify({"message": "User already exists"}), 409  # Conflict

    # Set active status based on role
    active_status = False if role == 'Service Professional' else True  

    try:
        new_user = app.security.datastore.create_user(
            email=email, 
            password=hash_password(password), 
            roles=[role],  # Ensure it's a list
            active=active_status  # Use the computed active status
        )

        db.session.commit()
        if role == 'Customer':
            new_customer = CustomerProfile(
                user_id=new_user.id,
                fname=fname,
                lname=lname,
                location=location
            )
            db.session.add(new_customer)
        elif role == 'Service Professional':
            service_id = data.get('serviceType')
            experience = data.get('experience')
            pan_number = data.get('panNumber')
            print(service_id)
            print(experience)


            if not service_id or not experience or not pan_number:
                return jsonify({"message": "Invalid inputs"}), 400

            new_service_professional = ProfessionalProfile(
                user_id=new_user.id,
                fname=fname,
                lname=lname,
                location=location,
                experience=experience,
                service_id=service_id,
                pan_number=pan_number,
                avg_rating = 0.0,
                review_count = 9,
                past_client_count = 7
            )
            print("before")
            db.session.add(new_service_professional)
            print("after")
        db.session.commit()  # You need to commit the changes again
        return jsonify({"message": "User created"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating user", "error": str(e)}), 500
@app.route('/createservice', methods=['POST'])
@auth_required('token')  # ✅ Ensures token authentication
def createservice():
    try:
        data = request.get_json()
        print("Data received")

        name = data.get('name')
        print("Name: ", name)
        description = data.get('description')
        print("Description: ", description)
        base_price = data.get('base_price')
        print("Base price: ", base_price)
        time_required = data.get('time_required')
        print("Time Required: ", time_required)

        if not all([name, description, base_price, time_required]):
            return jsonify({"message": "Missing required fields"}), 400

        try:
            base_price = float(base_price)
            time_required = int(time_required)
        except ValueError:
            return jsonify({"message": "Invalid numeric values"}), 400

        new_service = Service(
            name=name,
            description=description,
            base_price=base_price,
            time_required=time_required,
        )

        db.session.add(new_service)
        db.session.commit()

        return jsonify({"message": "Service created successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Server error", "error": str(e)}), 500