import re
import logging
from collections import Counter

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Citation Extraction ---

def extract_citations(text):
    """
    Extracts numeric and author-year style citations from a given text.
    Returns:
        tuple: (list of numeric refs, list of author-year refs)
    """

    # Improved pattern for numeric citations like:
    # [1], [1, 2], [1–3], [1-3, 5], [1,2; 4-6]
    ref_pattern = r'\[(?:\d+[–\-,;\s]*)+\]'

    # Improved pattern for author citations like:
    # "Smith et al. (2020)", "Brown and Green (2019)", "Taylor (2015)"
    author_pattern = r'\b[A-Z][a-z]+(?:\s(?:et al\.|and\s[A-Z][a-z]+))?\s*\(\d{4}\)'

    # Find matches
    numeric_refs = re.findall(ref_pattern, text)
    author_refs = re.findall(author_pattern, text)

    # Clean and deduplicate
    numeric_refs = list(set(ref.strip() for ref in numeric_refs))
    author_refs = list(set(author.strip() for author in author_refs))

    logging.info(f"Found {len(numeric_refs)} numeric references and {len(author_refs)} author citations")
    return numeric_refs, author_refs


# --- Counting and Formatting ---

def count_citations(refs, authors):
    """
    Counts the frequency of numeric and author citations.
    """
    ref_counts = Counter(refs)
    author_counts = Counter(authors)
    return ref_counts, author_counts


def format_results(ref_counts, author_counts):
    """
    Formats the results into a structured dictionary.
    """
    ref_data = [{"Reference": ref, "Frequency": freq} for ref, freq in ref_counts.items()]
    author_data = [{"Author Citation": author, "Frequency": freq} for author, freq in author_counts.items()]
    
    result = {
        "references": sorted(ref_data, key=lambda x: x["Frequency"], reverse=True),
        "author_citations": sorted(author_data, key=lambda x: x["Frequency"], reverse=True),
        "total_references": len(ref_counts),
        "total_author_citations": len(author_counts)
    }

    return result


# --- Main Entry Point ---

def analyze_citations(input_text, return_raw_text=False):
    """
    Analyzes citations in the input text.
    Args:
        input_text (str): The text to analyze.
        return_raw_text (bool): Whether to include raw text in the output.
    Returns:
        dict: Analysis results.
    """
    if not input_text or not isinstance(input_text, str):
        logging.error("Input must be a non-empty string.")
        return {"error": "Input must be a non-empty string."}
    
    # Extract citations
    refs, authors = extract_citations(input_text)
    ref_counts, author_counts = count_citations(refs, authors)

    # Format results
    results = format_results(ref_counts, author_counts)
    
    if return_raw_text:
        results["raw_text"] = input_text[:1000] + "..." if len(input_text) > 1000 else input_text

    return results