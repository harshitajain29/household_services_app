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

    #cache-specific 
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_HOST = 'localhost'
    CACHE_REDIS_DB = 0
    CACHE_REDIS_URL = "redis://localhost:6379"
    WTF_CSRF_ENABLED = False
