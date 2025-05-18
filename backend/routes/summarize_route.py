# routes/summarize_route.py

from flask import Blueprint, request, jsonify, g
from models.summarizer import TextSummarizer
import utils.citation_analyzer as CitationAnalyzer
from utils.file_parser import PDFParser, DOCXParser
from database.history_db import HistoryDB
from config import Config
import json

# Create a blueprint for the summarize route
summarize_bp = Blueprint('summarize', __name__)

# Initialize the summarizer and history database
summarizer = TextSummarizer(Config.MODEL_PATH)
history_db = HistoryDB()

@summarize_bp.route('/summarize', methods=['POST'])
def summarize():
    # Get the user's IP address
    ip_address = request.remote_addr

    # Check if text is provided in form data
    text = request.form.get("text", None)

    # Check if a file is uploaded
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

    # Generate summary
    summary = summarizer.summarize(text)
    # summary = text
    # summary = CitationAnalyzer.analyze_citations(text)
    
    citations = CitationAnalyzer.analyze_citations(text)
    citations_json = json.dumps(citations)
    # Save the summary to the database
    history_db.save_summary(ip_address, text, summary, citations_json)

    return jsonify({"summary": summary})

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
