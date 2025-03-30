from flask import Flask
# from flask_login import login_required
from backend.config import LocalDevelopmentConfig
from backend.models import db, Users, Roles
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
from flask_caching import Cache
from backend.celery.celery_factory import celery
import flask_excel as excel
from backend.celery.tasks import *

def createApp():
    print("Creating Flask app...") 
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/')

    celery.conf.update(
        broker_url='redis://localhost:6379/0',
        result_backend='redis://localhost:6379/1',
        timezone = 'Asia/Kolkata'
    )
    app.config.from_object(LocalDevelopmentConfig)
    print("Configuration loaded.") 

    
    # model init
    db.init_app(app)
    print("Database initialized.")
    
    # cache init
    cache = Cache(app)
    app.cache = cache


    #flask security
    datastore = SQLAlchemyUserDatastore(db, Users, Roles)
    # app.cache = cache

    app.security = Security(app, datastore= datastore, register_blueprint=False)
    app.app_context().push()

    print("Flask-Security initialized.")
    
    return app
print("Starting app creation...")
app = createApp()

# celery_app = celery_init_app(app)

import backend.create_initial_data

import backend.routes

# import backend.celery.celery_schedule

excel.init_excel(app)

if __name__ == '__main__':
    print("Running Flask app...")  # Add this line
    app.run()
   