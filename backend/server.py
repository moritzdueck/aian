from doctest import debug
import json
from flask import Flask, Response, request, send_from_directory
from flask_restful import Api
from flask_cors import CORS
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

@app.route("/pmid/<int:pmid>")
def get_text_pmid(pmid):
    return database.get_text_as_dict_by_pmid(pmid)

@app.route("/entities/<int:text_id>")
def get_entities(text_id):
    return database.get_entities_as_dict(text_id)

@app.route("/semtypes")
def get_semtype():
    return send_from_directory('.', 'semtypes.json')

@app.route("/explore/<string:cui>")
def get_cui_neighborhood(cui):
    return database.get_term_neighborhood(cui)

@app.route("/snippet", methods=['POST'])
def get_snippet():
    json_body = json.loads(request.data)
    return database.get_snippet(json_body['text_id'], json_body['start'], json_body['end'], json_body['cui'])

@app.route("/relations", methods=['POST'])
def save_relations(body: str) -> str:
    print(body)
    return "OK"
    

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

if __name__ == '__main__':
    database.start()
    cors = CORS(app, origins="*", methods=['GET', 'POST', 'OPTIONS', 'HEAD'])
    app.run(host='0.0.0.0', port=5003, threaded=True)

