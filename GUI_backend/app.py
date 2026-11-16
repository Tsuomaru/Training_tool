
from flask import Flask, request, jsonify
import sqlite3
import uuid
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from io import BytesIO
import base64

app = Flask(__name__)

# Store the database inside GUI_backend
DB_PATH = Path(__file__).parent / "projects.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                training_attempt INTEGER NOT NULL
            )
        """)


@app.route("/")
def home():
    return "Training Tool Backend is running!"


@app.route("/api/test")
def test():
    return {"message": "Connected to Flask!"}


# Retrieve saved projects
@app.route("/api/projects", methods=["GET"])
def get_projects():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM projects"
        ).fetchall()

    projects = [
        {
            "id": row["id"],
            "name": row["name"],
            "status": row["status"],
            "trainingAttempt": row["training_attempt"]
        }
        for row in rows
    ]

    return jsonify(projects)


# Create and save a project
@app.route("/api/projects", methods=["POST"])
def create_project():
    data = request.get_json(silent=True) or {}
    name = data.get("name")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Project name is required"}), 400

    project = {
        "id": str(uuid.uuid4()),
        "name": name.strip(),
        "status": "Training",
        "trainingAttempt": 1
    }

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO projects (id, name, status, training_attempt)
            VALUES (?, ?, ?, ?)
            """,
            (
                project["id"],
                project["name"],
                project["status"],
                project["trainingAttempt"]
            )
        )

    return jsonify(project), 201


initialize_database()

if __name__ == "__main__":
    app.run(debug=True)
