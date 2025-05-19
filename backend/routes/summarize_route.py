# routes/summarize_route.py

from flask import Blueprint, request, jsonify, g
from models.summarizer import TextSummarizer
import utils.citation_analyzer as CitationAnalyzer
from utils.file_parser import PDFParser, DOCXParser
from database.history_db import HistoryDB
from config import Config
from models.NERProcessor import NERProcessor
import json

# Create a blueprint for the summarize route
summarize_bp = Blueprint('summarize', __name__)

# Initialize the summarizer and history database
history_db = HistoryDB()

@summarize_bp.route('/summarize', methods=['POST'])
def summarize():
    ip_address = request.remote_addr

    # Get selected model from form
    model_name = request.form.get("model", "Computer Science")  # default fallback
    model_path = Config.MODEL_PATHS.get(model_name)

    if not model_path:
        return jsonify({"error": f"Model '{model_name}' not supported."}), 400

    print(f"[INFO] Using model: {model_name} ({model_path})")
    # Load appropriate model
    summarizer = TextSummarizer(model_path)

    # Get text or file
    text = request.form.get("text", None)

    if 'file' in request.files:
        file = request.files['file']
        if file.filename.endswith('.pdf'):
            text = PDFParser.extract_text_from_pdf(file)
        elif file.filename.endswith('.docx'):
            text = DOCXParser.extract_text_from_docx(file)
        else:
            return jsonify({"error": "Unsupported file type. Please upload a PDF or DOCX file."}), 400

    if not text:
        return jsonify({"error": "No text or file provided."}), 400

    # Summarize and analyze citations
    summary = summarizer.summarize(text)
    citations = CitationAnalyzer.analyze_citations(text)
    citations_json = json.dumps(citations)
    entities = ner_processor.extract_entities(text)
    entities_json = json.dumps(entities)

    # Save to history DB
    history_db.save_summary(ip_address, text, summary, citations_json, entities_json)

    return jsonify({"summary": summary, "citations": citations})

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
    
@summarize_bp.route('/citations', methods=['POST'])
def citations():
    text = request.form.get("text", None)

    if 'file' in request.files:
        file = request.files['file']
        if file.filename.endswith('.pdf'):
            result = CitationAnalyzer.analyze_citations(file, is_pdf=True)
            return jsonify(result)
        elif file.filename.endswith('.docx'):
            text = DOCXParser.extract_text_from_docx(file)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

    if not text:
        return jsonify({"error": "No text or file provided."}), 400

    result = CitationAnalyzer.analyze_citations(text)
    return jsonify(result)

ner_processor = NERProcessor(Config.NER_PATH)

@summarize_bp.route("/extract", methods=["POST"])
def extract_entities():
    """
    Роут для извлечения сущностей из текста
    
    Пример запроса:
    {
        "text": "The Transformer model was developed by Geoffrey Hinton at the University of Toronto."
    }
    
    Ответ:
    [
      {"term": "Transformer", "type": "METHOD"},
      {"term": "Geoffrey Hinton", "type": "PERSON"},
      {"term": "University of Toronto", "type": "LOCATION"}
    ]
    """
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data["text"]
    try:
        entities = ner_processor.extract_entities(text)
        return jsonify(entities)
    except Exception as e:
        return jsonify({"error": str(e)}), 500