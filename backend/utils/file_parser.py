# utils/pdf_parser.py

import re
import pdfplumber
import docx
import requests
from bs4 import BeautifulSoup

class PDFParser:
    GROBID_URL = "http://localhost:8070/api/processFulltextDocument"

    @staticmethod
    def extract_text_from_pdf(file):
        """
        Extracts raw body text from a PDF file using GROBID.
        `file` is expected to be a file-like object (e.g. from Flask's request.files).
        """
        files = {'input': (file.filename, file.stream, file.mimetype)}
        try:
            response = requests.post(PDFParser.GROBID_URL, files=files, timeout=30)
            response.raise_for_status()
        except requests.RequestException as e:
            raise RuntimeError(f"GROBID request failed: {str(e)}")

        tei_xml = response.text
        text = PDFParser.parse_tei_to_text(tei_xml)
        return PDFParser.clean_pdf_text(text)

    @staticmethod
    def parse_tei_to_text(tei_xml):
        """
        Parses TEI XML returned by GROBID and extracts main text content.
        """
        soup = BeautifulSoup(tei_xml, "lxml-xml")
        body = soup.find("body")

        if not body:
            return ""

        paragraphs = body.find_all("p")
        text = "\n".join(p.get_text(separator=" ", strip=True) for p in paragraphs)

        return text

    @staticmethod
    def clean_pdf_text(text):
        # Fix hyphenated line breaks and unify line breaks into spaces
        text = text.replace("-\n", "")
        text = text.replace("\n", " ")

        # Remove multiple spaces
        text = re.sub(r"\s{2,}", " ", text)

        
        return text.strip()