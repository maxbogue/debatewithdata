import json, random

from flask import g, jsonify, make_response, redirect, request, session, url_for

from debatewithdata.models import app, User
from debatewithdata.utils import ApiError

DB_FILE = 'db.json'
ID_CHARS = '0123456789abcdef'


def load_db():
    with open(DB_FILE) as f:
        return json.load(f)


DB = load_db()


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
@app.route('/login')
@app.route('/logout')
@app.route('/register')
@app.route('/<claim_id>')
def index(claim_id=None):
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
        return jsonify(DB)
    elif request.method == 'POST':
        id = ''.join(random.choice(ID_CHARS) for _ in range(12))
        DB[id] = request.get_json()
        save_db()
        return jsonify(new_claim_id=id)


@app.route('/api/claim/<id>', methods=['GET', 'PUT', 'DELETE'])
def claim_one(id):
    if request.method == 'GET':
        return jsonify(DB[id])
    elif request.method == 'PUT':
        DB[id] = request.get_json()
        save_db()
    elif request.method == 'DELETE':
        del DB[id]
        save_db()
