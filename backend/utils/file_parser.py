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

import re
import pdfplumber

class PDFParser:
    @staticmethod
    def extract_text_from_pdf(file):
        text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return PDFParser.clean_pdf_text(text)

    @staticmethod
    def clean_pdf_text(text):
        # Merge hyphenated words and unify whitespace
        text = text.replace("-\n", "")  # Fix hyphenated line breaks
        text = text.replace("\n", " ")  # Replace all newlines with spaces

        # Remove excessive whitespace
        text = re.sub(r"\s{2,}", " ", text)

        # Remove common boilerplate sections before main content
        # Look for the first meaningful section, e.g., Introduction
        intro_match = re.search(r"(1\.\s*INTRODUCTION|INTRODUCTION)", text, re.IGNORECASE)
        if intro_match:
            text = text[intro_match.start():]

        # Optionally remove contents/TOC if detected before intro
        toc_match = re.search(r"TABLE OF CONTENTS", text, re.IGNORECASE)
        if toc_match and intro_match and toc_match.start() < intro_match.start():
            text = text[:toc_match.start()] + text[intro_match.start():]

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