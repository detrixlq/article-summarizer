# models/summarizer.py
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration

class TextSummarizer:
    def __init__(self, model_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[INFO] TextSummarizer using device: {self.device}")

        self.tokenizer = T5Tokenizer.from_pretrained(model_path)
        self.model = T5ForConditionalGeneration.from_pretrained(model_path)

    def summarize(self, text):
        inputs = self.tokenizer(f"summarize: {text}", return_tensors="pt", max_length=512, truncation=True)
        summary_ids = self.model.generate(
            inputs["input_ids"],
            max_length=250,
            min_length=50,
            length_penalty=1.5,
            num_beams=6,
            early_stopping=False,
            no_repeat_ngram_size=3
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary