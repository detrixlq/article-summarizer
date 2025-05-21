from flask import Blueprint, request, jsonify
from models.summarizer import TextSummarizer
import utils.citation_analyzer as CitationAnalyzer
from utils.file_parser import PDFParser
from database.history_db import HistoryDB
from config import Config
from models.NERProcessor import NERProcessor
from models.sectionsum import load_local_summarizer, generate_section_summaries
import json, re
from functools import lru_cache

# Initialize components
summarize_bp = Blueprint('summarize', __name__)
history_db = HistoryDB()
loaded_summarizers = {}
section_summarizer = load_local_summarizer()
ner_processor = NERProcessor(Config.NER_PATH)

def preprocess_text(text):
    """
    Removes numeric references like [1], [1-5], or [1, 2] from the text.
    This prevents confusion for the model.
    """
    # Regex to match numeric references like [1], [1-5], [1, 2], etc.
    return re.sub(r'\[\d+[,\s–\-]*\d*\]', '', text).strip()

# Helper Functions
def extract_text_from_request(request):
    text = None
    uploaded_file = request.files.get("file")
    if uploaded_file and uploaded_file.filename:
        if uploaded_file.filename.lower().endswith('.pdf'):
            try:
                text = PDFParser.extract_text_from_pdf(uploaded_file)
            except Exception as e:
                return None, f"Failed to parse PDF: {str(e)}"
        else:
            return None, "Unsupported file type. Please upload a PDF file."
    if not text:
        text = request.form.get("text", "").strip()
    if not text:
        return None, "No valid text or file provided."
    return text, None

def get_summarizer(model_name):
    if model_name not in loaded_summarizers:
        model_path = Config.MODEL_PATHS.get(model_name)
        if not model_path:
            raise ValueError(f"Model '{model_name}' not supported.")
        loaded_summarizers[model_name] = TextSummarizer(model_path)
    return loaded_summarizers[model_name]

def save_summary_to_db(ip_address, text, full_summary="", citations_json=None, entities_json=None, section_summaries_json=None):
    history_db.save_summary(ip_address, text, full_summary, citations_json, entities_json, section_summaries_json)

@lru_cache(maxsize=128)
def cached_citation_analysis(text):
    return CitationAnalyzer.analyze_citations(text)

@lru_cache(maxsize=128)
def cached_entity_extraction(text):
    return ner_processor.extract_entities(text)

def process_text(text, model_name, sectional=False):
    text = preprocess_text(text)
    summarizer = get_summarizer(model_name)
    summary = generate_section_summaries(text, section_summarizer) if sectional else summarizer.summarize(text)
    citations = cached_citation_analysis(text)
    entities = cached_entity_extraction(text)
    return {"summary": summary, "citations": citations, "entities": entities}

# Routes
@summarize_bp.route('/summarize', methods=['POST'])
def summarize():
    ip_address = request.remote_addr
    text, error = extract_text_from_request(request)
    if error:
        return jsonify({"error": error}), 400
    model_name = request.form.get("model", "Computer Science")
    result = process_text(text, model_name)
    save_summary_to_db(ip_address, text, result["summary"], json.dumps(result["citations"]), json.dumps(result["entities"]))
    return jsonify(result)

@summarize_bp.route('/sectional_summary', methods=['POST'])
def sectional_summary():
    ip_address = request.remote_addr
    text, error = extract_text_from_request(request)
    if error:
        return jsonify({"error": error}), 400
    result = process_text(text, "Sectional Summarizer", sectional=True)
    save_summary_to_db(ip_address, text, "", json.dumps(result["citations"]), json.dumps(result["entities"]), json.dumps(result["summary"]))
    return jsonify({
        "section_summaries": result["summary"],
        "citations": result["citations"],
        "entities": result["entities"]
    })

@summarize_bp.route('/history', methods=['GET'])
def get_history():
    ip_address = request.remote_addr
    history = history_db.get_history_by_ip(ip_address)
    return jsonify({"history": history})

@summarize_bp.route('/clear-history', methods=['DELETE'])
def clear_history():
    ip_address = request.remote_addr
    try:
        history_db.clear_history(ip_address)
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
        return jsonify({"error": str(e)}), 500

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