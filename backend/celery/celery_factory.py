from celery import Celery, Task
from flask import Flask, current_app as app

# class CeleryConfig():
#     broker_url = 'redis://localhost:6379/0'
#     result_backend = 'redis://localhost:6379/1'
#     timezone = 'Asia/Kolkata'

def celery_init_app():
    class FalskTask(Task):
        def __call__(self, *args: object, **kwargs: object):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery()
    # celery_app.config_from_object(CeleryConfig)
    # celery_app.set_default()
    # app.extensions["celery"] = celery_app
    return celery_app

celery = celery_init_app()