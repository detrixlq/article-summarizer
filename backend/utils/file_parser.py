# utils/pdf_parser.py

import re
import pdfplumber
import docx

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
    @staticmethod
    def extract_text_from_pdf(file):
        text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return PDFParser.clean_pdf_text(text)
    
    @staticmethod
    def clean_pdf_text(text):
        # Fix hyphenated words broken across lines
        text = text.replace("-\n", "")  # merges hyphenated line breaks
        text = text.replace("\n", " ")  # replace newlines with spaces
        return text


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