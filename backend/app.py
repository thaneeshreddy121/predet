# from flask import Flask
# from flask_cors import CORS
# from flask_pymongo import PyMongo
# import os

# # Import configuration
# from config import config_by_name

# # Initialize Flask app
# app = Flask(__name__)

# # Load configuration based on ENV (default: dev)
# env = os.getenv("FLASK_ENV", "dev")  # Get environment variable or default to "dev"
# app.config.from_object(config_by_name[env])

# # Enable CORS
# CORS(app)

# # Initialize MongoDB
# mongo = PyMongo(app)


# # Import and register routes
# from routes import register_routes
# register_routes(app)



# if __name__ == "__main__":
#     app.run(debug=app.config["DEBUG"])

from flask import Flask
from flask_cors import CORS
import os
from config import config_by_name
from database import init_db
from routes import register_routes
from dotenv import load_dotenv

load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Load configuration based on ENV (default: dev)
env = os.getenv("FLASK_ENV", "dev")
app.config.from_object(config_by_name[env])

# Enable CORS
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
    supports_credentials=True,
)

# Initialize MongoDB
db = init_db(app)

# Register Routes
register_routes(app)

@app.route("/")
def home():
    return " Backend is Running! 🚀"

"""print("\n========== API ROUTES ==========")

for rule in app.url_map.iter_rules():
    methods = ", ".join(sorted(rule.methods - {"HEAD", "OPTIONS"}))
    print(f"{methods:20} {rule}")

print("================================\n")
"""
if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"])
