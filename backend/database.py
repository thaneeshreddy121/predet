from flask_pymongo import PyMongo
from pymongo.errors import PyMongoError

mongo = PyMongo()


def init_db(app):
    """Initialize MongoDB connection."""

    mongo.init_app(app)

    try:
        mongo.cx.admin.command("ping")
        mongo.db.list_collection_names()

        print("✅ MongoDB Connected Successfully!")
        print(f"📦 MongoDB Database: {mongo.db.name}")

    except PyMongoError as e:
        print("❌ MongoDB Connection Failed!", e)
        raise

    return mongo.db