import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration

class TextSummarizer:
    def __init__(self, model_path):
        # Use GPU if available, otherwise CPU
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[INFO] TextSummarizer using device: {self.device}")

        # Load tokenizer and model
        self.tokenizer = T5Tokenizer.from_pretrained(model_path, local_files_only=True)
        self.model = T5ForConditionalGeneration.from_pretrained(model_path, local_files_only=True).to(self.device)

    def summarize(self, text, max_input_length=512, max_output_length=250, min_output_length=50):
        """
        Summarizes the input text using the T5-small model.

        Args:
            text (str): Input text to summarize.
            max_input_length (int): Maximum number of tokens for the input text.
            max_output_length (int): Maximum number of tokens for the summary.
            min_output_length (int): Minimum number of tokens for the summary.

        Returns:
            str: Generated summary.
        """
        try:
            # Tokenize the input text
            inputs = self.tokenizer(
                f"summarize: {text}", 
                return_tensors="pt", 
                max_length=max_input_length, 
                truncation=True, 
                padding="max_length"
            ).to(self.device)

            # Generate summary
            summary_ids = self.model.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_length=max_output_length,
                min_length=min_output_length,
                length_penalty=2.0,  # Slightly higher penalty for longer summaries
                num_beams=4,         # Reduced from 6 to 4 for faster inference
                early_stopping=True, # Stop generation as soon as the model predicts an EOS token
                no_repeat_ngram_size=3,
                repetition_penalty=1.2  # Penalize repeated phrases
            )

            # Decode the generated summary
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            return summary.strip()

        except Exception as e:
            print(f"[ERROR] Failed to generate summary: {str(e)}")
            return None