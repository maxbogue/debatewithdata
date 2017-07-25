import json, random, time

from flask import g, jsonify, make_response, redirect, request, session, url_for

from debatewithdata.models import app, User
from debatewithdata.utils import ApiError, find_one

DB_FILE = 'db.json'
ID_CHARS = '0123456789abcdef'


def load_db():
    try:
        with open(DB_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


DB = load_db()
CLAIMS = DB.setdefault('claims', {})
SOURCES = DB.setdefault('sources', {})
POINTS = DB.setdefault('points', {})
COMMENTS = DB.setdefault('comments',
                         {'claims': {},
                          'sources': {},
                          'points': {}})


def save_db():
    with open(DB_FILE, 'w') as f:
        json.dump(DB, f)


def gen_id():
    return ''.join(random.choice(ID_CHARS) for _ in range(12))


def save_points(client_points):
    points = [[], []]
    for i, side_points in enumerate(client_points):
        for point in side_points:
            id = point['id'] if 'id' in point else gen_id()
            save_point(id, point)
            points[i].append(id)
    return points


def save_point(id, point):
    assert type(point) == dict
    print('save point', id, point)
    if 'points' in point:
        point['points'] = save_points(point['points'])
    POINTS[id] = point


def load_point(id):
    point = POINTS[id].copy()
    if 'points' in point:
        point['points'] = [[load_point(id) for id in side_points]
                           for side_points in point['points']]
    return point


def save_claim(id, claim):
    claim['points'] = save_points(claim.get('points', [[], []]))
    CLAIMS[id] = claim


def load_claim(id):
    claim = CLAIMS[id].copy()
    if 'points' in claim:
        claim['points'] = [[load_point(id) for id in side_points]
                           for side_points in claim['points']]
    return claim


def req_fields(*fields, **typed_fields):
    data = request.get_json()
    missing_fields = [field for field in fields if field not in data]
    for field, t in typed_fields.items():
        if not isinstance(data[field], t):
            raise ApiError('Field has wrong type: ' + field)
    if missing_fields:
        raise ApiError('Missing field(s): ' + ', '.join(missing_fields))
    return (data[field] for field in fields)


@app.errorhandler(ApiError)
def handle_api_error(err):
    return jsonify(message=err.message), err.status_code


def auth_required():
    token = request.headers.get('Authorization')
    if token:
        g.user = User.verify_token(token.split()[1])
    else:
        raise ApiError('No auth token found.', 401)


def get_comments(comments):
    return jsonify([c for c in comments if not c.get('deleted')])


def add_comment(comments):
    auth_required()
    text, = req_fields('text')
    comment = {
        'id': gen_id(),
        'text': text,
        'author': g.user.username,
        'created': int(time.time()),
    }
    comments.append(comment)
    save_db()
    return jsonify(comment=comment)


def delete_comment(comments, id):
    auth_required()
    comment = find_one(comments, lambda c: c.get('id') == id)
    if not comment:
        raise ApiError('Comment not found.', 404)
    if comment['author'] != g.user.username:
        raise ApiError('Comment is not yours to delete.', 401)
    comment['deleted'] = True
    save_db()
    return jsonify(message='success')


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
        return jsonify({id: load_claim(id) for id in CLAIMS})
    elif request.method == 'POST':
        id = gen_id()
        CLAIMS[id] = request.get_json()
        save_db()
        return jsonify(id=id)


@app.route('/api/claim/<id>', methods=['GET', 'PUT', 'DELETE'])
def claim_one(id):
    if request.method == 'GET':
        return jsonify(load_claim(id))
    elif request.method == 'PUT':
        if id not in CLAIMS:
            raise ApiError('Claim not found.')
        save_claim(id, request.get_json())
        save_db()
        return jsonify(message='success')
    elif request.method == 'DELETE':
        del CLAIMS[id]
        save_db()
        return jsonify(message='success')


@app.route('/api/claim/<id>/comment', methods=['GET', 'POST'])
def claim_comments(id):
    comments = COMMENTS['claims'].setdefault(id, [])
    if request.method == 'GET':
        return get_comments(comments)
    elif request.method == 'POST':
        return add_comment(comments)


@app.route('/api/claim/<claim_id>/comment/<comment_id>', methods=['DELETE'])
def del_claim_comment(claim_id, comment_id):
    comments = COMMENTS['claims'].setdefault(claim_id, [])
    return delete_comment(comments, comment_id)


@app.route('/api/source', methods=['GET', 'POST'])
def source_all():
    if request.method == 'GET':
        return jsonify(SOURCES)
    elif request.method == 'POST':
        id = gen_id()
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


@app.route('/api/source/<id>/comment', methods=['GET', 'POST'])
def source_comments(id):
    comments = COMMENTS['sources'].setdefault(id, [])
    if request.method == 'GET':
        return get_comments(comments)
    elif request.method == 'POST':
        return add_comment(comments)


@app.route('/api/source/<source_id>/comment/<comment_id>', methods=['DELETE'])
def del_source_comment(source_id, comment_id):
    comments = COMMENTS['sources'].setdefault(source_id, [])
    return delete_comment(comments, comment_id)
