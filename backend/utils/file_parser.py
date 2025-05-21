import re
import requests
from bs4 import BeautifulSoup

class PDFParser:
    GROBID_URL = "http://localhost:8070/api/processFulltextDocument"

    @staticmethod
    def extract_text_from_pdf(file):
        """
        Extracts raw body text from a PDF file using GROBID.
        `file` is expected to be a file-like object (e.g., from Flask's request.files).
        """
        # Ensure the file is valid and has content
        if not file or not file.filename.lower().endswith('.pdf'):
            raise ValueError("Invalid file type. Please upload a PDF file.")

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

        # Extract paragraphs and section titles
        paragraphs = body.find_all(["p", "head"])  # Include section headings (`<head>`)
        text_parts = []

        for element in paragraphs:
            tag_name = element.name
            content = element.get_text(separator=" ", strip=True)

            if tag_name == "head":  # Section headers
                content = f"\n\n{content.upper()}\n"  # Add formatting for section headers
            elif tag_name == "p":  # Paragraphs
                content = f"{content}"

            text_parts.append(content)

        return "\n".join(text_parts).strip()

    @staticmethod
    def clean_pdf_text(text):
        """
        Cleans the extracted text by fixing hyphenated line breaks, normalizing spaces,
        and removing unwanted characters.
        """
        # Fix hyphenated words split across lines
        text = re.sub(r"-\s*\n", "", text)  # Remove hyphens followed by a newline
        text = re.sub(r"\n+", " ", text)    # Replace multiple newlines with a single space

        # Normalize whitespace
        text = re.sub(r"\s{2,}", " ", text)  # Replace multiple spaces with a single space

        # Remove special characters and control characters (except common punctuation)
        text = re.sub(r"[^\w\s.,;:'\"!?()\[\]{}—–\-]", "", text)

        # Strip leading/trailing whitespace
        return text.strip()