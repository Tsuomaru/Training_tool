
from flask import Flask, request, jsonify
import sqlite3
import uuid
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from io import BytesIO
import base64
from ImageProcessing import read_tiff 
import os 
import tempfile
import rasterio
from rasterio.enums import Resampling
import numpy as np

app = Flask(__name__)

# Store the database inside GUI_backend
DB_PATH = Path(__file__).parent / "projects.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

@app.route("/api/upload-tiff", methods=["POST"])
def upload_tiff():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith((".tif", ".tiff")):
        return jsonify({"error": "Only TIFF files are allowed"}), 400

    with tempfile.TemporaryDirectory() as folder:
        file_path = os.path.join(folder, "uploaded.tif")
        file.save(file_path)

        try:
            # Read TIFF metadata using Rasterio
            info = read_tiff(file_path)

            # Generate image preview using rasterio
            with rasterio.open(file_path) as image:
                scale = min(1200 / image.width, 1200 / image.height, 1)

                preview_width = max(1, int(image.width * scale))
                preview_height = max(1, int(image.height * scale))

                band_indexes = list(range(1, min(image.count, 3) + 1))

                pixels = image.read(
                    indexes=band_indexes,
                    out_shape=(len(band_indexes), preview_height, preview_width),
                    resampling=Resampling.bilinear
                )

                # Convert pixel values to a displayable 8-bit range
                channels = []
                for band in pixels:
                    low, high = np.percentile(band, [2, 98])

                    if high > low:
                        band = np.clip((band - low) / (high - low) * 255, 0, 255)
                    else:
                        band = np.zeros_like(band)

                    channels.append(band.astype(np.uint8))

                if len(channels) == 1:
                    preview = Image.fromarray(channels[0], mode="L")
                else:
                    while len(channels) < 3:
                        channels.append(channels[-1])

                    preview = Image.fromarray(
                        np.stack(channels, axis=-1),
                        mode="RGB"
                    )

                buffer = BytesIO()
                preview.save(buffer, format="PNG")

            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

            return jsonify({
                "filename": file.filename,
                **info,
                "preview": "data:image/png;base64," + encoded
            })

        except Exception as error:
            return jsonify({"error": str(error)}), 400

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
