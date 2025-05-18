import re
import json
import logging
from collections import Counter
import pdfplumber


try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None

# Подавление предупреждений pdfminer
logging.getLogger("pdfminer").setLevel(logging.ERROR)

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_text_from_pdf_plumber(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ''
            for page in pdf.pages:
                page_text = page.extract_text() or ''
                text += page_text
        logging.info(f"pdfplumber: Extracted {len(text)} characters from PDF")
        return text
    except Exception as e:
        logging.error(f"pdfplumber: Error reading PDF: {str(e)}")
        return None

def extract_text_from_pdf_pypdf2(pdf_path):
    if PdfReader is None:
        logging.error("PyPDF2 not installed. Install with 'pip install PyPDF2'")
        return None
    try:
        reader = PdfReader(pdf_path)
        text = ''
        for page in reader.pages:
            page_text = page.extract_text() or ''
            text += page_text
        logging.info(f"PyPDF2: Extracted {len(text)} characters from PDF")
        return text
    except Exception as e:
        logging.error(f"PyPDF2: Error reading PDF: {str(e)}")
        return None

def extract_text(input_data, is_pdf=False):
    if not is_pdf:
        return input_data
    text = extract_text_from_pdf_plumber(input_data)
    if text and len(text.strip()) > 100:
        return text
    logging.info("Falling back to PyPDF2 due to insufficient text from pdfplumber")
    text = extract_text_from_pdf_pypdf2(input_data)
    if text:
        return text
    return f"Error: Unable to extract text from PDF"

def extract_citations(text):
    ref_pattern = r'\[\d+\]|\[\d+-\d+\]|\[\d+\s*,\s*\d+\]|\[\d+\s*;\s*\d+\]|\[\d+\s*,\s*\d+\s*,\s*\d+\]'
    author_pattern = (
        r'\([A-Za-z\s]+et al\., \d{4}\)|[A-Za-z\s]+et al\. \(\d{4}\)'
        r'|\([A-Za-z\s]+, \d{4}\)|[A-Za-z\s]+\(\d{4}\)'
        r'|\([A-Za-z\s]+ and [A-Za-z\s]+, \d{4}\)|[A-Za-z\s]+ and [A-Za-z\s]+\(\d{4}\)'
        r'|\([A-Za-z\s]+et al\., \d{4}, \d{4}\)|[A-Za-z\s]+et al\. \(\d{4}, \d{4}\)'
        r'|\([A-Za-z\s]+et al\., \d{4};\s*\d{4}\)|[A-Za-z\s]+et al\. \(\d{4};\s*\d{4}\)'
        r'|\([A-Za-z\s]+, p\. \d+\)|[A-Za-z\s]+\(p\. \d+\)'
        r'|\([A-Za-z\s]+, \d{4}, p\. \d+\)|[A-Za-z\s]+\(\d{4}, p\. \d+\)'
        r'|[A-Za-z\s]+et al\. \d{4}'
    )
    
    refs = re.findall(ref_pattern, text)
    authors = re.findall(author_pattern, text)
    
    logging.info(f"Found {len(refs)} references and {len(authors)} author citations")
    return refs, authors

def count_citations(refs, authors):
    ref_counts = Counter(refs)
    author_counts = Counter(authors)
    return ref_counts, author_counts

def format_results(ref_counts, author_counts):
    ref_data = [{"Reference": ref, "Frequency": freq} for ref, freq in ref_counts.items()]
    author_data = [{"Author Citation": author, "Frequency": freq} for author, freq in author_counts.items()]
    
    return {
        "references": sorted(ref_data, key=lambda x: x["Frequency"], reverse=True),
        "author_citations": sorted(author_data, key=lambda x: x["Frequency"], reverse=True),
        "total_references": len(ref_counts),
        "total_author_citations": len(author_counts)
    }

def analyze_citations(input_data, is_pdf=False, return_raw_text=False):
    text = extract_text(input_data, is_pdf)
    if text.startswith("Error"):
        logging.error(text)
        return {"error": text}
    
    refs, authors = extract_citations(text)
    ref_counts, author_counts = count_citations(refs, authors)
    results = format_results(ref_counts, author_counts)
    
    if return_raw_text:
        results["raw_text"] = text[:1000] + "..." if len(text) > 1000 else text
    
    return results
