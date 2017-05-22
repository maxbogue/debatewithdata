import json

from flask import g, jsonify, make_response, redirect, request, session, url_for

from models import app, User


@app.route('/')
@app.route('/login')
@app.route('/logout')
@app.route('/register')
def index():
    return make_response(open('index.html').read())


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.login(data['username'], data['password'])
        responseData = {'auth_token': user.gen_auth_token()}
        return make_response(jsonify(responseData)), 200
    except ValueError as e:
        responseData = {'message': str(e)}
        return make_response(jsonify(responseData)), 400


@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        user = User.register(data['username'], data['password'], data['email'])
        responseData = {'auth_token': user.gen_auth_token()}
        return make_response(jsonify(responseData)), 200
    except ValueError as e:
        responseData = {'message': str(e)}
        return make_response(jsonify(responseData)), 400
