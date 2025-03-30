from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()


class Users(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), nullable= True)
    last_name = db.Column(db.String(50), nullable=True)
    email_id = db.Column(db.String(120), unique=True, nullable=False)
    pass_hash = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Integer, default=True)
    city = db.Column(db.String(100))
    roles = db.relationship("Roles", backref="bearers", secondary="role_map")


class Roles(db.Model, RoleMixin):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    access_type = db.Column(db.String(80), nullable=False)


class RoleMap(db.Model):
    __tablename__ = "role_map"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"))


class ServiceProfessionals(db.Model):
    __tablename__ = "service_professionals"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    feedbacks_received = db.Column(db.Integer, default=0)
    average_rating = db.Column(db.Float, default=0.0)
    clients_till_date = db.Column(db.Integer, default=0)
    experience_in_years = db.Column(db.Integer)
    aadhar_number = db.Column(db.String(10), nullable=True)

class Services(db.Model):
    __tablename__ = "services"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_name = db.Column(db.String, nullable=False)
    service_details = db.Column(db.String)
    duration_estimate = db.Column(db.Integer)
    required_payment = db.Column(db.Integer, nullable=False)
    

class ServiceRequests(db.Model):
    __tablename__ = "service_requests"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    service_professional_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    request_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    statuschange_date = db.Column(db.DateTime, nullable=True)
    service_date = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(20), default="requested")
    rating = db.Column(db.Integer, nullable=True)
    feedback = db.Column(db.Text, nullable=True)
