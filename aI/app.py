import logging
logging.basicConfig(level=logging.INFO)
from flask import Flask
from controllers.minimize_fields import minimize_fields_bp

app = Flask(__name__)
app.register_blueprint(minimize_fields_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
