from transformers import pipeline
import json


class NERProcessor:
    def __init__(self, model_path: str):
        """
        Инициализация процессора NER.
        
        :param model_path: Путь к папке с моделью
        """
        self.ner_pipeline = pipeline("ner", model=model_path, tokenizer=model_path)
        self.known_locations = {"canada", "montréal", "québec", "toronto", "usa", "germany", "france", "london"}
        self.blacklist_terms = {
            "i", "an", "update", "to", "this", "article", "is", "included", "at", "the",
            "end", "citation", "analysis", "of", "scientific", "received", ":", "26",
            "nov", "ember", "bel", "m", "o", "misc"
        }
        self.blacklist_types = {"BEL_0", "BEL_1", "O", "MISC"}

    def _postprocess(self, results):
        """Склеивает субтокены и улучшает типы"""
        merged_tokens = []
        current_token = ""
        current_label = ""

        for res in results:
            token = res["word"]
            label = res["entity"]

            if label.startswith("B-"):
                if current_token:
                    merged_tokens.append({"term": current_token.strip(), "type": current_label[2:]})
                current_token = token
                current_label = label
            elif label.startswith("I-") and current_label and label[2:] == current_label[2:]:
                if token.startswith("##"):
                    current_token += token[2:]
                else:
                    current_token += " " + token
            else:
                if current_token:
                    merged_tokens.append({"term": current_token.strip(), "type": current_label[2:]})
                current_token = token
                current_label = label

        if current_token:
            merged_tokens.append({"term": current_token.strip(), "type": current_label[2:]})

        # Маппинг типов
        label_map = {
            "PER": "PERSON",
            "ORG": "ORGANIZATION",
            "LOC": "LOCATION",
            "GPE": "LOCATION",
            "MISC": "METHOD"
        }

        remapped_entities = [
            {"term": e["term"], "type": label_map.get(e["type"], e["type"])} 
            for e in merged_tokens
        ]

        return remapped_entities


    def _improve_types(self, entities):
        """Улучшает типы (например, Canada → LOCATION)"""
        improved = []
        for entity in entities:
            term = entity["term"].lower()
            if entity["type"] == "ORGANIZATION" and term in self.known_locations:
                improved.append({"term": entity["term"], "type": "LOCATION"})
            else:
                improved.append(entity)
        return improved

    def _filter_noise(self, entities):
        """Фильтрация шума и нежелательных терминов"""
        return [
            e for e in entities
            if e["term"].lower() not in self.blacklist_terms and e["type"] not in self.blacklist_types
        ]

    def extract_entities(self, text: str):
        """
        Основная функция для извлечения сущностей
        
        :param text: Входной текст
        :return: JSON-список сущностей
        """
        raw_results = self.ner_pipeline(text)
        cleaned_entities = self._postprocess(raw_results)
        better_entities = self._improve_types(cleaned_entities)
        final_entities = self._filter_noise(better_entities)

        return final_entities

    def extract_entities_json(self, text: str):
        """
        То же самое, но возвращает JSON-строку
        
        :param text: Входной текст
        :return: JSON строка
        """
        entities = self.extract_entities(text)
        return json.dumps(entities, indent=2, ensure_ascii=False)