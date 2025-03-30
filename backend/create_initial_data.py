from flask import current_app as app
from flask_security import SQLAlchemyUserDatastore, hash_password
from backend.models import db

with app.app_context():
    db.create_all()

    userdatastore : SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name = 'admin', access_type = 'super user')
    userdatastore.find_or_create_role(name = 'Service Professional', access_type = 'general user')
    userdatastore.find_or_create_role(name = 'Customer', access_type = 'general user')
    
    if (not userdatastore.find_user(email_id = 'admin@gmail.com')):
        userdatastore.create_user(
                    first_name='Main',  
                    last_name='Admin',
                    email_id='admin@gmail.com', 
                    pass_hash=hash_password('admin'), 
                    roles=['admin']
                )

    if (not userdatastore.find_user(email_id = 'test_customer@gmail.com')):
        userdatastore.create_user(
            first_name='Test', 
            last_name='Customer',
            email_id='test_customer@gmail.com', 
            pass_hash=hash_password('test_customer'), 
            roles=['Customer']
        )


    db.session.commit()