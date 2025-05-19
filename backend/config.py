# config.py

class Config:
    DEBUG = True
    HOST = "0.0.0.0"
    PORT = 5000
    MODEL_PATHS = {
    "Computer Science": "../model/model_cs",
    "Economics": "..model/model_eco", 
    "Electrical Engineering": "../model/model_ee",
    "Mathematics": "../model/model_math",
    "Physics": "../model/model_physics",
    "Quantitative Biology": "../model/model_bio",
    "Quantitative Finance": "../model/model_finance",
    "Statistics" : "../model/model_stat"
}
    NER_PATH = "../model/ner_model"