import json
import os
import sys
import tempfile
from pathlib import Path

from flask import Blueprint, abort, jsonify, request, send_from_directory

bp = Blueprint("main", __name__)

STATIC_DIR = Path(__file__).resolve().parent.parent / "mosiacs"
DATA_DIR = STATIC_DIR / "data"
JSON_DIR = DATA_DIR / "json"

# Make parser importable — in the Docker image it lives at /srv/parser
_parser_dir = str(Path(__file__).resolve().parent.parent / "parser")
if _parser_dir not in sys.path:
    sys.path.insert(0, _parser_dir)

ALLOWED_EXTENSIONS = {".c", ".py"}


@bp.route("/api/upload", methods=["POST"])
def upload_file():
    """Save uploaded file to data/ directory without processing."""
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "error": "No file selected"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"success": False, "error": f"Unsupported file type '{ext}'. Only .c and .py files are accepted."}), 400

    # Save directly to DATA_DIR
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    file_path = DATA_DIR / file.filename
    file.save(str(file_path))

    return jsonify({"success": True, "filename": file.filename})


@bp.route("/api/process-file", methods=["POST"])
def process_file():
    """Process an uploaded file and return trace data without saving to disk."""
    if "file" not in request.files:
        return jsonify({"success": False, "error": {"stage": "upload", "message": "No file provided"}}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "error": {"stage": "upload", "message": "No file selected"}}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"success": False, "error": {"stage": "upload", "message": f"Unsupported file type '{ext}'. Only .c and .py files are accepted."}}), 400

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


@bp.route("/api/codefiles")
def list_code_files():
    """List all available .c and .py source files in data/."""
    if not DATA_DIR.is_dir():
        return jsonify([])
    files = sorted(p.name for p in DATA_DIR.glob("*") if p.suffix in {".c", ".py"} and p.is_file())
    return jsonify(files)


@bp.route("/api/process", methods=["POST"])
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

    from run import deal

    results = []
    errors = []

    for filename in files:
        # Security check
        if "/" in filename or "\\" in filename or ".." in filename:
            errors.append({"file": filename, "stage": "validation", "message": "Invalid filename"})
            continue

        input_path = DATA_DIR / filename
        if not input_path.is_file():
            errors.append({"file": filename, "stage": "validation", "message": "File not found"})
            continue

        # Process the file
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                output_path = Path(tmpdir) / f"{input_path.stem}.json"
                
                # Run the parser
                return_code = deal(str(input_path), output=str(output_path), seed=-1)
                
                # Read the result
                with open(output_path) as f:
                    result = json.load(f)

                if result.get("success", False):
                    # Save to data/json directory
                    JSON_DIR.mkdir(parents=True, exist_ok=True)
                    save_name = f"{input_path.stem}.json"
                    save_path = JSON_DIR / save_name
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


@bp.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@bp.route("/<path:path>")
def static_files(path):
    return send_from_directory(STATIC_DIR, path)
