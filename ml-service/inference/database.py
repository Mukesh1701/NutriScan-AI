import sqlite3
from datetime import datetime


DATABASE = "nutriscan.db"


def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_history (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            food TEXT NOT NULL,

            confidence REAL,

            weight_g REAL,

            calories REAL,

            protein REAL,

            carbs REAL,

            fat REAL,

            fiber REAL,

            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def save_scan(
    food,
    confidence,
    weight_g,
    calories,
    protein,
    carbs,
    fat,
    fiber
):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO scan_history
        (
            food,
            confidence,
            weight_g,
            calories,
            protein,
            carbs,
            fat,
            fiber,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        food,
        confidence,
        weight_g,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        datetime.now().isoformat()
    ))

    conn.commit()

    scan_id = cursor.lastrowid

    conn.close()

    return scan_id


def get_history():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM scan_history
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]