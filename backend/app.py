# app.py

from flask import Flask
from flask_cors import CORS
from config import Config
from routes.summarize_route import summarize_bp

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register the summarize route
app.register_blueprint(summarize_bp)

if __name__ == '__main__':
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)