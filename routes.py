import json, os, random, time
from pyblake2 import blake2b

from flask import g, jsonify, make_response, redirect, request, session, url_for

from debatewithdata.models import app, User
from debatewithdata.utils import ApiError, find_one

DB_FILE = 'dev.json' if os.environ.get('FLASK_DEBUG') == '1' else 'db.json'
ID_CHARS = '0123456789abcdef'


def hash(text):
    return blake2b(text.encode(), digest_size=20).hexdigest()


def load_db():
    try:
        with open(DB_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


DB = load_db()
CLAIMS = DB.setdefault('claim', {})
SOURCES = DB.setdefault('source', {})
POINTS = DB.setdefault('point', {})
BLOBS = DB.setdefault('blob', {})
CLAIM_REVS = DB.setdefault('claim_rev', {})
SOURCE_REVS = DB.setdefault('source_rev', {})
POINT_REVS = DB.setdefault('point_rev', {})
COMMENTS = DB.setdefault('comments', {'claim': {}, 'source': {}, 'point': {}})
STARS = DB.setdefault('stars', {'claim': {}, 'source': {}, 'point': {}})


def save_db():
    with open(DB_FILE, 'w') as f:
        json.dump(DB, f)


def gen_id(n=12):
    return ''.join(random.choice(ID_CHARS) for _ in range(n))


def make_text(text):
    h = hash(text)
    BLOBS[h] = text
    return h


def subset_equals(d1, d2):
    for k in d1:
        if k not in d2 or d1[k] != d2[k]:
            return False
    return True


def load_text(obj):
    obj['text'] = BLOBS[obj['text']]


def save_points(points):
    return [[save_point(point) for point in side_points]
            for side_points in points]


def save_point(point):
    parent_id = None
    parent = None
    if 'id' in point:
        point_id = point['id']
        parent_id = POINTS[point_id]['head']
        parent = POINT_REVS[parent_id]
    else:
        # new point
        point_id = gen_id()

    point_rev = {'id': point_id, 'type': point['type']}
    if point['type'] == 'subclaim':
        point_rev['text'] = make_text(point['text'])
        point_rev['points'] = save_points(point['points'])
    elif point['type'] == 'claim':
        point_rev['claimId'] = point['claimId']
    elif point['type'] == 'source':
        point_rev['sourceId'] = point['sourceId']
    elif point['type'] == 'text':
        point_rev['text'] = make_text(point['text'])
    else:
        raise Exception('bad point type')

    if parent:
        # check if there was a actually a change
        if subset_equals(point_rev, parent):
            # we're not making a new revision
            return parent_id
        point_rev['parent'] = parent_id
    point_rev['created'] = int(time.time())
    point_rev['author'] = g.user.username

    rev_id = gen_id(24)
    POINT_REVS[rev_id] = point_rev
    POINTS[point_id] = {
        'head': rev_id,
    }
    return rev_id


def load_point_rev(rev_id):
    point = POINT_REVS[rev_id].copy()
    if 'text' in point:
        load_text(point)
    if 'points' in point:
        point['points'] = [[load_point_rev(id) for id in side_points]
                           for side_points in point['points']]
    return point


def save_claim(id, claim):
    parent_id = None
    parent = None
    if id in CLAIMS:
        parent_id = CLAIMS[id]['head']
        parent = CLAIM_REVS[parent_id]

    claim_rev = {
        'id': id,
        'text': make_text(claim['text']),
        'points': save_points(claim['points']),
    }

    if parent:
        if subset_equals(claim_rev, parent):
            # we're not making a new revision
            return parent_id
        claim_rev['parent'] = parent_id
    claim_rev['created'] = int(time.time())
    claim_rev['author'] = g.user.username

    rev_id = gen_id(24)
    CLAIM_REVS[rev_id] = claim_rev
    CLAIMS[id] = {
        'head': rev_id,
    }


def load_claim(id):
    if id not in CLAIMS:
        raise ApiError('Claim not found.', 404)
    rev_id = CLAIMS[id]['head']
    claim = CLAIM_REVS[rev_id].copy()
    if 'text' in claim:
        load_text(claim)
    if 'points' in claim:
        claim['points'] = [[load_point_rev(id) for id in side_points]
                           for side_points in claim['points']]
    return claim


def delete_claim(id):
    if id not in CLAIMS:
        raise ApiError('Claim not found.', 404)
    claim = CLAIMS[id]
    parent_id = claim['head']
    parent = CLAIM_REVS[parent_id]
    if parent.get('deleted'):
        return

    rev = {
        'id': id,
        'parent': claim['head'],
        'created': int(time.time()),
        'author': g.user.username,
        'deleted': True,
    }
    rev_id = gen_id(24)
    CLAIM_REVS[rev_id] = rev
    claim['head'] = rev_id


def save_source(id, source):
    parent_id = None
    parent = None
    if id in source:
        parent_id = SOURCES[id]['head']
        parent = SOURCE_REVS[parent_id]

    source_rev = {
        'id': id,
        'text': make_text(source['text']),
        'url': source['url'],
        'ary': source.get('ary', 0),
    }

    if parent:
        if subset_equals(source_rev, parent):
            # we're not making a new revision
            return parent_id
        source_rev['parent'] = parent_id
    source_rev['created'] = int(time.time())
    source_rev['author'] = g.user.username

    rev_id = gen_id(24)
    SOURCE_REVS[rev_id] = source_rev
    SOURCES[id] = {
        'head': rev_id,
    }


def load_source(id):
    if id not in SOURCES:
        raise ApiError('Source not found.', 404)
    rev_id = SOURCES[id]['head']
    source = SOURCE_REVS[rev_id].copy()
    if 'text' in source:
        load_text(source)
    return source


def delete_source(id):
    if id not in SOURCES:
        raise ApiError('Source not found.', 404)
    source = SOURCES[id]
    parent_id = source['head']
    parent = SOURCE_REVS[parent_id]
    if parent.get('deleted'):
        return

    rev = {
        'id': id,
        'parent': parent_id,
        'created': int(time.time()),
        'author': g.user.username,
        'deleted': True,
    }
    rev_id = gen_id(24)
    SOURCE_REVS[rev_id] = rev
    source['head'] = rev_id


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


def auth_optional():
    token = request.headers.get('Authorization')
    if token:
        g.user = User.verify_token(token.split()[1])
    else:
        g.user = None


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
@app.route('/guide')
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
        claims = {}
        for id in CLAIMS:
            claim = load_claim(id)
            if not claim.get('deleted'):
                claims[id] = claim
        return jsonify(claims)
    elif request.method == 'POST':
        auth_required()
        id = gen_id()
        save_claim(id, request.get_json())
        save_db()
        return jsonify(id=id, claim=load_claim(id))


@app.route('/api/claim/<id>', methods=['GET', 'PUT', 'DELETE'])
def claim_one(id):
    if request.method == 'GET':
        return jsonify(load_claim(id))
    elif request.method == 'PUT':
        auth_required()
        if id not in CLAIMS:
            raise ApiError('Claim not found.')
        save_claim(id, request.get_json())
        save_db()
        return jsonify(claim=load_claim(id))
    elif request.method == 'DELETE':
        auth_required()
        delete_claim(id)
        save_db()
        return jsonify(message='success')


@app.route('/api/claim/<id>/comment', methods=['GET', 'POST'])
def claim_comments(id):
    comments = COMMENTS['claim'].setdefault(id, [])
    if request.method == 'GET':
        return get_comments(comments)
    elif request.method == 'POST':
        return add_comment(comments)


@app.route('/api/claim/<claim_id>/comment/<comment_id>', methods=['DELETE'])
def del_claim_comment(claim_id, comment_id):
    comments = COMMENTS['claim'].setdefault(claim_id, [])
    return delete_comment(comments, comment_id)


@app.route('/api/source', methods=['GET', 'POST'])
def source_all():
    if request.method == 'GET':
        sources = {}
        for id in SOURCES:
            source = load_source(id)
            if not source.get('deleted'):
                sources[id] = source
        return jsonify(sources)
    elif request.method == 'POST':
        auth_required()
        id = gen_id()
        save_source(id, request.get_json())
        save_db()
        return jsonify(id=id, source=load_source(id))


@app.route('/api/source/<id>', methods=['GET', 'PUT', 'DELETE'])
def source_one(id):
    if request.method == 'GET':
        return jsonify(load_source(id))
    elif request.method == 'PUT':
        auth_required()
        if id not in SOURCES:
            raise ApiError('Source not found.')
        save_source(id, request.get_json())
        save_db()
        return jsonify(message='success')
    elif request.method == 'DELETE':
        auth_required()
        delete_source(id)
        save_db()
        return jsonify(message='success')


@app.route('/api/source/<id>/comment', methods=['GET', 'POST'])
def source_comments(id):
    comments = COMMENTS['source'].setdefault(id, [])
    if request.method == 'GET':
        return get_comments(comments)
    elif request.method == 'POST':
        return add_comment(comments)


@app.route('/api/source/<source_id>/comment/<comment_id>', methods=['DELETE'])
def del_source_comment(source_id, comment_id):
    comments = COMMENTS['source'].setdefault(source_id, [])
    return delete_comment(comments, comment_id)


@app.route('/api/point/<id>/comment', methods=['GET', 'POST'])
def point_comments(id):
    comments = COMMENTS['point'].setdefault(id, [])
    if request.method == 'GET':
        return get_comments(comments)
    elif request.method == 'POST':
        return add_comment(comments)


@app.route('/api/point/<point_id>/comment/<comment_id>', methods=['DELETE'])
def del_point_comment(point_id, comment_id):
    comments = COMMENTS['point'].setdefault(point_id, [])
    return delete_comment(comments, comment_id)


def point_ids(points):
    for side_points in points:
        for point_rev_id in side_points:
            point_rev = POINT_REVS[point_rev_id]
            yield point_rev['id']
            if 'points' in point_rev:
                for subpoint_id in point_ids(point_rev['points']):
                    yield subpoint_id


def star_for_client(type, id):
    star_users = STARS[type].setdefault(id, [])
    return {
        'count': len(star_users),
        'starred': g.user is not None and g.user.username in star_users,
    }


def claim_stars(claim_id):
    claim = CLAIMS[claim_id]
    claim_rev = CLAIM_REVS[claim['head']]
    point_stars = {
        point_id: star_for_client('point', point_id)
        for point_id in point_ids(claim_rev['points'])
    }
    return {
        'star': star_for_client('claim', claim_id),
        'points': point_stars,
    }


@app.route('/api/<type>/<id>/star', methods=['GET', 'POST'])
def stars(type, id):
    if request.method == 'GET':
        auth_optional()
        if type == 'claim':
            return jsonify(claim_stars(id))
        return jsonify(star=star_for_client(type, id))
    elif request.method == 'POST':
        auth_required()
        star_users = STARS[type].setdefault(id, [])
        if g.user.username in star_users:
            star_users.remove(g.user.username)
        else:
            star_users.append(g.user.username)
        save_db()
        return jsonify(star=star_for_client(type, id))
