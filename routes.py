import json, random

from flask import g, jsonify, make_response, redirect, request, session, url_for

from debatewithdata.models import app, User
from debatewithdata.utils import ApiError

DB_FILE = 'db.json'
ID_CHARS = '0123456789abcdef'


def load_db():
    try:
        with open(DB_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            'claims': {},
            'sources': {},
        }


DB = load_db()
CLAIMS = DB['claims']
SOURCES = DB['sources']


def save_db():
    with open(DB_FILE, 'w') as f:
        json.dump(DB, f)


def req_fields(*fields, **typed_fields):
    data = request.get_json()
    missing_fields = [field for field in fields if field not in data]
    for field, t in typed_fields.items():
        if not isinstance(data[field], t):
            raise ApiError('Field has wrong type: ' + field)
    if missing_fields:
        raise ApiError('Missing field(s): ' + missing_fields.join(', '))
    return (data[field] for field in fields)


@app.errorhandler(ApiError)
def handle_api_error(err):
    return jsonify(message=err.message), err.status_code


@app.route('/')
@app.route('/account')
@app.route('/login')
@app.route('/logout')
@app.route('/register')
@app.route('/claims')
@app.route('/claims/add')
@app.route('/claim/<id>')
@app.route('/claim/<id>/edit')
@app.route('/sources')
@app.route('/sources/add')
@app.route('/source/<id>')
@app.route('/source/<id>/edit')
def index(id=None):
    return make_response(open('index.html').read())


@app.route('/api/login', methods=['POST'])
def login():
    user = User.login(*req_fields('username', 'password'))
    return jsonify(auth_token=user.gen_auth_token())


@app.route('/api/register', methods=['POST'])
def register():
    user = User.register(*req_fields('username', 'password', 'email'))
    return jsonify(auth_token=user.gen_auth_token())


@app.route('/api/claim', methods=['GET', 'POST'])
def claim_all():
    if request.method == 'GET':
        return jsonify(CLAIMS)
    elif request.method == 'POST':
        id = ''.join(random.choice(ID_CHARS) for _ in range(12))
        CLAIMS[id] = request.get_json()
        save_db()
        return jsonify(id=id)


@app.route('/api/claim/<id>', methods=['GET', 'PUT', 'DELETE'])
def claim_one(id):
    if request.method == 'GET':
        return jsonify(CLAIMS[id])
    elif request.method == 'PUT':
        if id not in CLAIMS:
            raise ApiError('Claim not found.')
        CLAIMS[id] = request.get_json()
        save_db()
        return jsonify(message='success')
    elif request.method == 'DELETE':
        del CLAIMS[id]
        save_db()
        return jsonify(message='success')


@app.route('/api/source', methods=['GET', 'POST'])
def source_all():
    if request.method == 'GET':
        return jsonify(SOURCES)
    elif request.method == 'POST':
        id = ''.join(random.choice(ID_CHARS) for _ in range(12))
        SOURCES[id] = request.get_json()
        save_db()
        return jsonify(id=id)


@app.route('/api/source/<id>', methods=['GET', 'PUT', 'DELETE'])
def source_one(id):
    if request.method == 'GET':
        return jsonify(SOURCES[id])
    elif request.method == 'PUT':
        if id not in SOURCES:
            raise ApiError('Source not found.')
        SOURCES[id] = request.get_json()
        save_db()
        return jsonify(message='success')
    elif request.method == 'DELETE':
        del SOURCES[id]
        save_db()
        return jsonify(message='success')
