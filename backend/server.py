from doctest import debug
import io
from flask import Flask, Response, request, send_from_directory
from flask_restful import Resource, Api
from flask_cors import CORS
from matplotlib import pyplot as plt
import db as db

app = Flask(__name__, static_folder='./frontend-build/dist/', static_url_path='/')
api = Api(app)

database = db.Database()

#set debug mode
app.debug = True

@app.before_request
def basic_authentication():
    if request.method.lower() == 'options':
        return Response()


@app.after_request
def add_header(response: Response):
    response.cache_control.max_age = 3600 * 24 * 365
    response.access_control_allow_origin = "*"
    return response


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route("/health")
def get_health():
    return "OK"


@app.route("/texts")
def get_texts():
    print("get_texts")
    return database.get_texts_as_dict()

@app.route("/texts/<int:text_id>")
def get_text(text_id):
    return database.get_text_as_dict(text_id)


@app.route("/entities/<int:text_id>")
def get_entities(text_id):
    return database.get_entities_as_dict(text_id)

@app.route("/semtypes")
def get_semtype():
    return send_from_directory('.', 'semtypes.json')
    

@app.route("/relations", methods=['POST'])
def save_relations(body: str) -> str:

    print(body)
    return "OK"
    


# @app.route("/sketch/png/<int:sketch_index>")
# def get_sketch(sketch_index):
#     fig = plt.figure()
#     buf = io.BytesIO()
#     fig.savefig(buf, format='png', bbox_inches='tight')
#     buf.seek(0)
#     return Response(buf, mimetype='image/png', headers={})


# class AllImages(Resource):

#     def __init__(self, **kwargs):
#         self.base_df = kwargs['base_df']

#     def get(self):
#         df = pd.DataFrame()
#         return base_df['img'].to_dict()


# api.add_resource(AllImages,
#                  "/all",
#                  resource_class_kwargs={'base_df': base_df})


cors = CORS(app, origins="*")

if __name__ == '__main__':
    database.connect()
    app.run(host='0.0.0.0', port=5003)

