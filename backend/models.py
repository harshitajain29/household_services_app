from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String, unique = True, nullable = False)
    password = db.Column(db.String, nullable = False)
    #flask-security specific 
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, default = True)
    roles = db.relationship('Role', backref = 'bearers', secondary='user_roles')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable = False)
    description = db.Column(db.String, nullable = False)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class ProfessionalProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    first_name = db.Column(db.String, nullable = False)
    last_name = db.Column(db.String, nullable = False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable = False)
    experience_in_years = db.Column(db.Integer, nullable=False)
    phone_number = db.Column(db.String, nullable = False)
    city = db.Column(db.String, nullable = False)
    aadhar_number = db.Column(db.String(12), nullable = False, unique = True)
    rating = db.Column(db.Float, nullable=False, default=0.0)
    # service = db.relationship('Service', backref=db.backref('professionals', lazy=True))
    # service_requests = db.relationship('ServiceRequest', backref=db.backref('professional', lazy=True))
    user = db.relationship('User', backref=db.backref('professional_profile', lazy=True))

class Service(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, nullable = False)
    description = db.Column(db.String, nullable = False)
    base_price = db.Column(db.Float, nullable = False)
    time_required = db.Column(db.Integer, nullable = False)

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer_profile.id'), nullable = False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional_profile.id'), nullable = False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable = False)
    request_date = db.Column(db.DateTime, nullable = False, default=db.func.current_timestamp())
    status = db.Column(db.String, nullable = False, default='pending')
    remarks = db.Column(db.String, nullable = True)

class CustomerProfile(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    first_name = db.Column(db.String, nullable = False)
    last_name = db.Column(db.String, nullable = False)
    phone_number = db.Column(db.String, nullable = False)
    city = db.Column(db.String, nullable = False)
    # service_requests = db.relationship('ServiceRequest', backref=db.backref('customer', lazy=True))
    user = db.relationship('User', backref=db.backref('customer_profile', lazy=True))