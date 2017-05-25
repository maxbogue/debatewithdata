import json

from flask import g, jsonify, make_response, redirect, request, session, url_for

from debatewithdata.models import app, User
from debatewithdata.utils import ApiError


@app.errorhandler(ApiError)
def handle_api_error(err):
    return jsonify(message=err.message), err.status_code


@app.route('/')
@app.route('/login')
@app.route('/logout')
@app.route('/register')
def index():
    return make_response(open('index.html').read())


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.login(data['username'], data['password'])
    responseData = {'auth_token': user.gen_auth_token()}
    return jsonify(responseData), 200


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    user = User.register(data['username'], data['password'], data['email'])
    responseData = {'auth_token': user.gen_auth_token()}
    return jsonify(responseData), 200
