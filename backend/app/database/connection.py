import sqlite3
import os
from typing import Optional
from app.core.config import settings
from app.core.logging_config import logger

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sentinel_x.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT NOT NULL,
        full_name TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
    );
    """)

    # Network Flows table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS flows (
        flow_id TEXT PRIMARY KEY,
        switch_id TEXT,
        src_ip TEXT,
        dst_ip TEXT,
        src_port INTEGER,
        dst_port INTEGER,
        protocol TEXT,
        packet_count INTEGER,
        byte_count INTEGER,
        duration_sec REAL,
        packet_rate REAL,
        byte_rate REAL,
        tcp_flags TEXT,
        timestamp TEXT,
        classification TEXT,
        confidence REAL,
        anomaly_score REAL,
        is_unknown INTEGER,
        status TEXT
    );
    """)

    # Incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        incident_id TEXT PRIMARY KEY,
        flow_id TEXT,
        detected_at TEXT,
        last_observed_at TEXT,
        severity TEXT,
        classification TEXT,
        confidence REAL,
        anomaly_score REAL,
        unknown_score REAL,
        status TEXT,
        is_zero_day_candidate INTEGER,
        src_ip TEXT,
        dst_ip TEXT,
        src_port INTEGER,
        dst_port INTEGER,
        protocol TEXT,
        packet_count INTEGER,
        byte_count INTEGER,
        duration_sec REAL,
        packet_rate REAL,
        byte_rate REAL,
        tcp_flags TEXT,
        recommended_action TEXT,
        mitigation_status TEXT,
        mitigation_audit TEXT
    );
    """)

    # Audit Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        username TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()
    logger.info("Initialized SQLite database schema successfully.")
