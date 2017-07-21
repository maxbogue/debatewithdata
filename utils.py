class ApiError(Exception):
    def __init__(self, message, status_code=400):
        Exception.__init__(self)
        self.message = message
        self.status_code = status_code


def find_one(xs, p):
    for x in xs:
        if p(x):
            return x
    return None
