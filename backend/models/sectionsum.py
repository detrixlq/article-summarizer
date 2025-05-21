
import re
import requests
import pdfplumber
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from config import Config

def load_local_summarizer(path=Config.MODEL_PATHS["Sectional Summarizer"]):
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSeq2SeqLM.from_pretrained(path)
    return pipeline("summarization", model=model, tokenizer=tokenizer)


def fallback_split(text, chunk_size=300):
    words = text.split()
    chunks = [words[i:i+chunk_size] for i in range(0, len(words), chunk_size)]
    return {f"chunk_{i+1}": " ".join(chunk) for i, chunk in enumerate(chunks)}

def summarize_section(summarizer, section_text, section_name=""):
    words = section_text.split()
    short_text = " ".join(words[:400])
    prompt = f"summarize this part of a scientific paper:\n\n{short_text}"
    return summarizer(prompt, max_length=100, min_length=30, do_sample=False)[0]['summary_text']

def generate_section_summaries(text, summarizer):
    print("📚 Нарезаем на блоки и суммируем как chunks")
    chunks = fallback_split(text, chunk_size=600)
    summaries = {}
    for i, (chunk_name, chunk_text) in enumerate(chunks.items(), start=1):
        try:
            summary = summarize_section(summarizer, chunk_text, f"part {i}")
            summaries[f"part_{i}"] = summary
        except Exception as e:
            print(f"❌ Ошибка при суммаризации {chunk_name}: {e}")
    return summaries