"""
Flask server for Code Mosaic Visualizer.

Serves the front-end static files and exposes a small API so the
browser can read JSON trace data at runtime.

Usage:
    pip install flask
    python server.py

Then open http://localhost:5000 in your browser.
"""

import os
import json
import sys
import tempfile
from pathlib import Path
from flask import Flask, send_from_directory, jsonify, abort, request

app = Flask(__name__)

# ── paths ────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "mosiacs")
DATA_DIR   = os.path.join(STATIC_DIR, "data")
JSON_DIR   = os.path.join(DATA_DIR, "json")
PARSER_DIR = os.path.join(BASE_DIR, "parser")
TESTS_DIR  = os.path.join(PARSER_DIR, "tests")


# ── API: serve code files ────────────────────────────────────────────

@app.route("/api/codefiles")
def list_code_files():
    """List all available .c and .py source files in data/."""
    if not os.path.isdir(DATA_DIR):
        return jsonify([])
    files = [f for f in os.listdir(DATA_DIR) 
             if f.endswith((".c", ".py")) and os.path.isfile(os.path.join(DATA_DIR, f))]
    files.sort()
    return jsonify(files)


@app.route("/api/upload", methods=["POST"])
def upload_file():
    """Save uploaded file to data/ directory without processing."""
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "error": "No file selected"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".c", ".py"):
        return jsonify({"success": False, "error": f"Unsupported file type '{ext}'. Only .c and .py files are accepted."}), 400

    # Save directly to DATA_DIR
    os.makedirs(DATA_DIR, exist_ok=True)
    file_path = os.path.join(DATA_DIR, file.filename)
    file.save(file_path)

    return jsonify({"success": True, "filename": file.filename})


@app.route("/api/process-file", methods=["POST"])
def process_file():
    """Process an uploaded file and return trace data without saving to disk."""
    if "file" not in request.files:
        return jsonify({"success": False, "error": {"stage": "upload", "message": "No file provided"}}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "error": {"stage": "upload", "message": "No file selected"}}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".c", ".py"):
        return jsonify({"success": False, "error": {"stage": "upload", "message": f"Unsupported file type '{ext}'. Only .c and .py files are accepted."}}), 400

    # Add parser directory to path
    if PARSER_DIR not in sys.path:
        sys.path.insert(0, PARSER_DIR)

    from run import deal

    # Process in temp directory
    with tempfile.TemporaryDirectory() as tmpdir:
        # Save uploaded file to temp directory
        src_path = os.path.join(tmpdir, file.filename)
        file.save(src_path)

        # Output JSON path in temp directory
        stem = os.path.splitext(file.filename)[0]
        out_path = os.path.join(tmpdir, f"{stem}.json")

        # Run the full pipeline: instrument → compile → run → normalize
        return_code = deal(src_path, output=out_path, seed=-1)

        # Read the result
        with open(out_path) as f:
            result = json.load(f)

    return jsonify(result)


@app.route("/api/process", methods=["POST"])
def process_code_files():
    """Process selected code files from data/ directory."""
    data = request.get_json()
    if not data or "files" not in data:
        return jsonify({
            "success": False,
            "error": {"stage": "request", "message": "No files specified"}
        }), 400

    files = data["files"]
    if not isinstance(files, list) or len(files) == 0:
        return jsonify({
            "success": False,
            "error": {"stage": "request", "message": "Files must be a non-empty array"}
        }), 400

    # Add parser directory to path
    if PARSER_DIR not in sys.path:
        sys.path.insert(0, PARSER_DIR)

    from run import deal

    results = []
    errors = []

    for filename in files:
        # Security check
        if "/" in filename or "\\" in filename or ".." in filename:
            errors.append({"file": filename, "stage": "validation", "message": "Invalid filename"})
            continue

        input_path = os.path.join(DATA_DIR, filename)
        if not os.path.isfile(input_path):
            errors.append({"file": filename, "stage": "validation", "message": "File not found"})
            continue

        # Process the file
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                output_path = os.path.join(tmpdir, f"{os.path.splitext(filename)[0]}.json")
                
                # Run the parser
                return_code = deal(input_path, output=output_path, seed=-1)
                
                # Read the result
                with open(output_path) as f:
                    result = json.load(f)

                if result.get("success", False):
                    # Save to data/json directory
                    os.makedirs(JSON_DIR, exist_ok=True)
                    save_name = f"{os.path.splitext(filename)[0]}.json"
                    save_path = os.path.join(JSON_DIR, save_name)
                    with open(save_path, "w") as f:
                        json.dump(result, f, indent=2)
                    
                    results.append({
                        "file": filename,
                        "output": save_name,
                        "success": True,
                        "data": result  # Include the full result data
                    })
                else:
                    errors.append({
                        "file": filename,
                        "stage": result.get("error", {}).get("stage", "unknown"),
                        "message": result.get("error", {}).get("message", "Unknown error")
                    })

        except Exception as e:
            errors.append({
                "file": filename,
                "stage": "processing",
                "message": str(e)
            })

    # Return results
    if len(errors) > 0 and len(results) == 0:
        return jsonify({
            "success": False,
            "errors": errors
        }), 400
    
    return jsonify({
        "success": True,
        "processed": len(results),
        "results": results,
        "errors": errors if errors else None
    })


# ── Static files: serve the front-end ────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


# ── Run ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(" Code Mosaic server running at http://localhost:5000")
    app.run(debug=True, port=5000)
