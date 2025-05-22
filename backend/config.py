import os

class Config:
    DEBUG = True
    HOST = "0.0.0.0"
    PORT = 5000

    # Base path for models (default to "./model" if not set)
    MODEL_BASE_PATH = os.getenv("MODEL_BASE_PATH", "../model")

    # Refactored model paths to use the base path
    MODEL_PATHS = {
        "Computer Science": os.path.join(MODEL_BASE_PATH, "model_cs"),
        "Economics": os.path.join(MODEL_BASE_PATH, "model_eco"),
        "Electrical Engineering": os.path.join(MODEL_BASE_PATH, "model_ee"),
        "Mathematics": os.path.join(MODEL_BASE_PATH, "model_math"),
        "Physics": os.path.join(MODEL_BASE_PATH, "model_physics"),
        "Quantitative Biology": os.path.join(MODEL_BASE_PATH, "model_bio"),
        "Quantitative Finance": os.path.join(MODEL_BASE_PATH, "model_finance"),
        "Statistics": os.path.join(MODEL_BASE_PATH, "model_stat"),
        "Sectional Summarizer": os.path.join(MODEL_BASE_PATH, "section_sum_model", "t5-small-local"),
    }

    # Refactored NER path to use the base path
    NER_PATH = os.path.join(MODEL_BASE_PATH, "ner_model")