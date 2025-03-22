class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig():
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'viratkohliisthegoat'
    SECRET_KEY = 'abhisheksharmaismynextfavourite'
    SECURITY_TOKEN_AUTHENTICATION_HEADER  = 'Authentication-Token'
    WTF_CSRF_ENABLED = False
