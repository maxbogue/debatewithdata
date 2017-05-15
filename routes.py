import json

from flask import g, jsonify, make_response, redirect, request, session, url_for

from models import app

SUMMARY = '''Economic inequality refers to the income and wealth differences between individuals in a population. This discussion is about the amount of inequality, not about whether there should be any inequality. The Gini index is a way of measuring the income distribution of a population on a scale from 0 (everyone earns the same amount) to 1 (one person earns everything, everyone else gets nothing). The Gini index of the United States has been steadily rising since around 1970.

Other metrics commonly seen in take the form of “amount of wealth owned by the richest 10% of people” (sometimes 1% or 0.1%). By that metric the US is the most unequal of the top 20 developed nations.

See the Wikipedia article for more info.'''

ARGUMENT1A = '''test1a'''
ARGUMENT1B = '''test1b'''
ARGUMENT2A = '''test2a'''
ARGUMENT2B = '''test2b'''


@app.route('/')
@app.route('/login')
def index():
    return make_response(open('index.html').read())


@app.route('/api/issue/us-economic-inequality', methods=['GET'])
def node_all():
    return jsonify({
        'title':
            'US Economic Inequality',
        'summary':
            SUMMARY,
        'arguments': [[{
            'content': ARGUMENT1A
        }, {
            'content': ARGUMENT1B,
        }], [{
            'content': ARGUMENT2A,
        }, {
            'content': ARGUMENT2B,
        }]]
    })
