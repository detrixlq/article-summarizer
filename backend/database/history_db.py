# database/history_db.py

import sqlite3
from datetime import datetime

class HistoryDB:
    def __init__(self, db_path="history.db"):
        self.db_path = db_path
        self._initialize_db()

    def _initialize_db(self):
        """
        Initializes the SQLite database and creates the 'history' table if it doesn't exist.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ip_address TEXT NOT NULL,
                    original_text TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def save_summary(self, ip_address, original_text, summary):
        """
        Saves a summary to the database.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO history (ip_address, original_text, summary, timestamp)
                VALUES (?, ?, ?, ?)
            """, (ip_address, original_text, summary, datetime.now()))
            conn.commit()

    def get_history_by_ip(self, ip_address):
        """
        Retrieves all summaries for a given IP address.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT original_text, summary, timestamp
                FROM history
                WHERE ip_address = ?
                ORDER BY timestamp DESC
            """, (ip_address,))
            rows = cursor.fetchall()
            return [
                {"original_text": row[0], "summary": row[1], "timestamp": row[2]}
                for row in rows
            ]
        
    def clear_history(self, ip_address):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM history WHERE ip_address = ?", (ip_address,))
            conn.commit()