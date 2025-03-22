# from flask_restful import Api, Resource, fields, marshal_with
# from flask_security import auth_required
# from backend.models import Service
# api = Api(prefix='/api')

# service_fields = {
#     'id' : fields.Integer,
#     'name': fields.String,
#     'description': fields.String,
#     'base_price': fields.Float,
#     'time_required': fields.String,
# }

# class ServiceAPI(Resource):
#     @marshal_with(service_fields)
#     @auth_required('token')
#     def get(self, service_id):
#         service = Service.query.get(service_id)

#         if not service:
#             return {"message": "not found"}, 404
#         return service

# api.add_resource('/blogs/<int: service_id')