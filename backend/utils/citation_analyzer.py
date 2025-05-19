import re
import logging
from collections import Counter
import pdfplumber

try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None

# Setup logging
logging.getLogger("pdfminer").setLevel(logging.ERROR)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# --- PDF Text Extraction ---

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


# --- Citation Extraction ---

def extract_citations(text):
    # Find references like [9], [9, 15], [9-12], etc.
    ref_pattern = r'\[\d+(?:[\-,;]\s*\d+)*\]'
    
    # Match author citations like "Sarlis et al. (2020)", "Smith and Jones (2015)"
    author_pattern = r'[A-Z][a-zA-Z]+(?: et al\.| and [A-Z][a-zA-Z]+)? \(\d{4}\)'

    refs = re.findall(ref_pattern, text)
    authors = re.findall(author_pattern, text)
    
    logging.info(f"Found {len(refs)} numeric references and {len(authors)} author citations")
    return refs, authors


# --- Bibliography Parsing ---

def extract_bibliography_section(text):
    bib_markers = ['References', 'BIBLIOGRAPHY']
    for marker in bib_markers:
        if marker in text:
            return text.split(marker, 1)[1]
    return ""

def parse_bibliography_mapping(bib_text):
    bib_mapping = {}
    bib_entries = re.findall(r'\[(\d+)\]\s+(.+?)(?=\n\[|\Z)', bib_text, flags=re.DOTALL)
    
    for number, entry in bib_entries:
        author_year_match = re.search(r'([A-Z][a-zA-Z]+(?: et al\.| and [A-Z][a-zA-Z]+)?)?.*?(\d{4})', entry)
        if author_year_match:
            author = author_year_match.group(1) or "Unknown"
            year = author_year_match.group(2)
            citation = f"{author} ({year})"
            bib_mapping[number] = citation
    logging.info(f"Parsed {len(bib_mapping)} references from bibliography")
    return bib_mapping

def link_refs_to_authors(in_text_refs, bib_mapping):
    linked = []
    for ref in in_text_refs:
        numbers = re.findall(r'\d+', ref)
        for number in numbers:
            citation = bib_mapping.get(number)
            if citation:
                linked.append(citation)
    return Counter(linked)


# --- Counting and Formatting ---

def count_citations(refs, authors):
    ref_counts = Counter(refs)
    author_counts = Counter(authors)
    return ref_counts, author_counts

def format_results(ref_counts, author_counts, linked_refs=None):
    ref_data = [{"Reference": ref, "Frequency": freq} for ref, freq in ref_counts.items()]
    author_data = [{"Author Citation": author, "Frequency": freq} for author, freq in author_counts.items()]
    
    result = {
        "references": sorted(ref_data, key=lambda x: x["Frequency"], reverse=True),
        "author_citations": sorted(author_data, key=lambda x: x["Frequency"], reverse=True),
        "total_references": len(ref_counts),
        "total_author_citations": len(author_counts)
    }

    if linked_refs:
        linked_data = [{"Citation": k, "Frequency": v} for k, v in linked_refs.items()]
        result["linked_numbered_citations"] = sorted(linked_data, key=lambda x: x["Frequency"], reverse=True)

    return result


# --- Main Entry Point ---

def analyze_citations(input_data, is_pdf=False, return_raw_text=False):
    text = extract_text(input_data, is_pdf)
    if text.startswith("Error"):
        logging.error(text)
        return {"error": text}
    
    refs, authors = extract_citations(text)
    ref_counts, author_counts = count_citations(refs, authors)
    
    bib_text = extract_bibliography_section(text)
    bib_mapping = parse_bibliography_mapping(bib_text)
    linked_refs = link_refs_to_authors(refs, bib_mapping)

    results = format_results(ref_counts, author_counts, linked_refs)
    
    if return_raw_text:
        results["raw_text"] = text[:1000] + "..." if len(text) > 1000 else text

    return results
