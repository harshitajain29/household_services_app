from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
# from backend.resources import api
def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')

    app.config.from_object(LocalDevelopmentConfig)
    #model init 
    db.init_app(app)

    #flask-restful init 
    # api.init_app(app)

    #flask security
    datastore = SQLAlchemyUserDatastore(db, User, Role)

    app.security = Security(app,datastore=datastore, register_blueprint=False) #Disables the default behavior
    app.app_context().push()

    return app

app = createApp()
import backend.create_initial_data
import backend.routes

# @app.get('/')
# def home():
#     return render_template('index.html')

# @app.get('/protected')
# @auth_required()
# def protected():
#     return '<h1>only accessed by auth users</h1>'
if (__name__ == '__main__'):
    app.run(debug=True)