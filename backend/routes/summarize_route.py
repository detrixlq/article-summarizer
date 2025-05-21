# routes/summarize_route.py

from flask import Blueprint, request, jsonify, g
from models.summarizer import TextSummarizer
import utils.citation_analyzer as CitationAnalyzer
from utils.file_parser import PDFParser
from database.history_db import HistoryDB
from config import Config
from models.NERProcessor import NERProcessor
from models.sectionsum import load_local_summarizer, generate_section_summaries
import json

# Create a blueprint for the summarize route
summarize_bp = Blueprint('summarize', __name__)
# Initialize the summarizer and history database
history_db = HistoryDB()

print("[INIT] Loading base summarizer models...")

loaded_summarizers = {
    model_name: TextSummarizer(model_path)
    for model_name, model_path in Config.MODEL_PATHS.items()
}

section_summarizer = load_local_summarizer()

print("[INIT] All models loaded successfully.")

@summarize_bp.route('/summarize', methods=['POST'])
def summarize():
    ip_address = request.remote_addr

    # Get selected model
    model_name = request.form.get("model", "Computer Science")
    model_path = Config.MODEL_PATHS.get(model_name)

    if not model_path:
        return jsonify({"error": f"Model '{model_name}' not supported."}), 400

    print(f"[INFO] Using model: {model_name} ({model_path})")
    summarizer = loaded_summarizers.get(model_name)
    if not summarizer:
        return jsonify({"error": f"Model '{model_name}' not supported."}), 400


    # Try to extract text from file first
    text = None
    uploaded_file = request.files.get("file")

    if uploaded_file and uploaded_file.filename:
        if uploaded_file.filename.lower().endswith('.pdf'):
            try:
                text = PDFParser.extract_text_from_pdf(uploaded_file)
            except Exception as e:
                return jsonify({"error": f"Failed to parse PDF: {str(e)}"}), 400
        else:
            return jsonify({"error": "Unsupported file type. Please upload a PDF file."}), 400

    # Fallback to plain text if no file
    if not text:
        text = request.form.get("text", "").strip()

    if not text:
        return jsonify({"error": "No valid text or file provided."}), 400

    # 🔹 Full Summary
    full_summary = summarizer.summarize(text)

    # 🔹 Citation Analysis
    citations = CitationAnalyzer.analyze_citations(text)
    citations_json = json.dumps(citations)

    # 🔹 Named Entities
    entities = ner_processor.extract_entities(text)
    entities_json = json.dumps(entities)

    # 🔹 Save to DB
    history_db.save_summary(ip_address, text, full_summary, citations_json, entities_json)

    return jsonify({
        "summary": full_summary,
        "citations": citations,
        "entities": entities
    })


@summarize_bp.route('/history', methods=['GET'])
def get_history():
    # Get the user's IP address
    ip_address = request.remote_addr

    # Retrieve history from the database
    history = history_db.get_history_by_ip(ip_address)
    return jsonify({"history": history})

@summarize_bp.route('/clear-history', methods=['DELETE'])
def clear_history():
    ip_address = request.remote_addr
    try:
        history_db.clear_history(ip_address)  # Call the database function
        return jsonify({"message": "History cleared successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@summarize_bp.route('/history/<int:item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    ip_address = request.remote_addr
    try:
        history_db.delete_history_item(ip_address, item_id)
        return jsonify({"message": f"History item {item_id} deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting history item {item_id}: {e}")
        return jsonify({"error": str(e)}), 500


@summarize_bp.route('/citations', methods=['POST'])
def citations():
    text = request.form.get("text", None)

    if 'file' in request.files:
        file = request.files['file']
        if file.filename.endswith('.pdf'):
            result = CitationAnalyzer.analyze_citations(file, is_pdf=True)
            return jsonify(result)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

    if not text:
        return jsonify({"error": "No text or file provided."}), 400

    result = CitationAnalyzer.analyze_citations(text)
    return jsonify(result)

ner_processor = NERProcessor(Config.NER_PATH)

@summarize_bp.route("/extract", methods=["POST"])
def extract_entities():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data["text"]
    try:
        entities = ner_processor.extract_entities(text)
        return jsonify(entities)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@summarize_bp.route('/sectional_summary', methods=['POST'])
def sectional_summary():
    ip_address = request.remote_addr

    # Get selected model
    model_path = Config.SECTIONSUM_PATH

    if not model_path:
        return jsonify({"error": f"Model not supported."}), 400

    print(f"[INFO] Using model: sectional summary model ({model_path})")

    # Load full summarizer and section summarizer

    # Get text input or file
    text = request.form.get("text", None)
    if 'file' in request.files:
        file = request.files['file']
        if file.filename.endswith('.pdf'):
            from utils.file_parser import PDFParser
            text = PDFParser.extract_text_from_pdf(file)
        else:
            return jsonify({"error": "Unsupported file type. Please upload a PDF file."}), 400

    if not text:
        return jsonify({"error": "No text or file provided."}), 400

    # 🔹 Section Summaries
    section_summaries = generate_section_summaries(text, section_summarizer)
    section_summaries_json = json.dumps(section_summaries)
    # 🔹 Citation Analysis
    citations = CitationAnalyzer.analyze_citations(text)
    citations_json = json.dumps(citations)

    # 🔹 Named Entities
    entities = ner_processor.extract_entities(text)
    entities_json = json.dumps(entities)


    history_db.save_summary(ip_address, text, "", citations_json, entities_json, section_summaries_json)

    return jsonify({
        "section_summaries": section_summaries,
        "citations": citations,
        "entities": entities
    })

    