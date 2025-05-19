# utils/pdf_parser.py

import re
import pdfplumber
import docx
import requests
from bs4 import BeautifulSoup

class TextCleaner:
    @staticmethod
    def clean_text(text):
        """
        Cleans the input text by removing unwanted sections like tables of contents,
        headers, footers, references, and other irrelevant content.
        """
        # Define patterns for sections to exclude
        patterns_to_exclude = [
            r"(?i)table of contents",  # Table of contents
            r"(?i)references|bibliography|cited works",  # References/Bibliography
            r"(?i)appendix|appendices",  # Appendices
            r"https?://\S+",  # URLs (e.g., http://example.com or https://example.com)
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",  # Emails (e.g., user@example.com)
            r"\.{3,}",
            r"^\d+\s+",
            r"^\s*",
            r"^\d+(\.\d+)*\.\s*"

            
        ]

        # Split the text into paragraphs or sections
        sections = re.split(r'\n+', text)  # Split by blank lines

        # Filter out unwanted sections
        cleaned_sections = []
        found_abstract = False
        found_introduction = False

        for section in sections:
            # Check for "Abstract" section
            if not found_abstract and re.search(r"(?i)\babstract\b", section):
                found_abstract = True

            # If no "Abstract," check for "Introduction" section
            if not found_abstract and not found_introduction and re.search(r"(?i)\bintroduction\b", section):
                found_introduction = True

            # Start collecting text only after finding "Abstract" or "Introduction"
            if found_abstract or found_introduction:
                # Remove unwanted patterns from the section
                cleaned_section = section
                for pattern in patterns_to_exclude:
                    cleaned_section = re.sub(pattern, "", cleaned_section)

                # Add the cleaned section to the result
                cleaned_sections.append(cleaned_section.strip())

        # Join the remaining sections back into a single string
        cleaned_text = "\n\n".join(cleaned_sections).strip()
        return cleaned_text


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

        # # Attempt to locate main body start
        # section_keywords = [
        #     r"\b1\.\s*Abstract\b", r"\bAbstract\b",
        #     r"\b1\.\s*Introduction\b", r"\bIntroduction\b",
        #     r"\bBackground\b", r"\b1\.\s*Background\b",
        #     r"\bProblem Statement\b"
        # ]

        # intro_index = None
        # for pattern in section_keywords:
        #     match = re.search(pattern, text, re.IGNORECASE)
        #     if match:
        #         intro_index = match.start()
        #         break

        # # If intro found, trim before it
        # if intro_index:
        #     text = text[intro_index:]

        # # Remove Table of Contents if it appears before main content
        # toc_match = re.search(r"TABLE OF CONTENTS", text, re.IGNORECASE)
        # if toc_match and intro_index and toc_match.start() < intro_index:
        #     text = text[:toc_match.start()] + text[intro_index:]

        return text.strip()





class DOCXParser:
    @staticmethod
    def extract_text_from_docx(file):
        """
        Extracts text from a DOCX file and cleans it using TextCleaner.
        """
        doc = docx.Document(file)
        raw_text = '\n'.join(paragraph.text for paragraph in doc.paragraphs)
        cleaned_text = TextCleaner.clean_text(raw_text)
        return cleaned_text