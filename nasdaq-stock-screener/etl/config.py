# ETL Configuration
# This file can hold API keys, database credentials, etc.
# For security, it's better to use environment variables or a .env file (with python-dotenv).
# This file serves as a placeholder or for default values if env vars are not set.

import os

# --- Data Provider API Keys ---
# It's STRONGLY recommended to set these via environment variables.
# Example: export NASDAQ_API_KEY="your_actual_key"
NASDAQ_API_KEY = os.getenv("NASDAQ_API_KEY", "YOUR_NASDAQ_API_KEY_HERE")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "YOUR_ALPHA_VANTAGE_API_KEY_HERE")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "YOUR_FINNHUB_API_KEY_HERE")


# --- Database Configuration ---
# It's STRONGLY recommended to set these via environment variables.
DB_NAME = os.getenv("DB_NAME", "nasdaq_screener_db")
DB_USER = os.getenv("DB_USER", "your_db_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "your_db_password")
DB_HOST = os.getenv("DB_HOST", "localhost") # Or your DB host
DB_PORT = os.getenv("DB_PORT", "5432")


# --- ETL Settings ---
# List of NASDAQ common stock symbols to process.
# This could be a static list, or fetched from a dynamic source.
# For a full NASDAQ universe, this list would be very long and likely fetched dynamically.
# Placeholder for now.
NASDAQ_SYMBOLS_SAMPLE = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BRK.A", "JPM", "V"]

# Primary data provider
PRIMARY_DATA_PROVIDER = "nasdaq" # "nasdaq" or "alpha_vantage" or "finnhub"

# Whether to use a backup provider if the primary fails
USE_BACKUP_PROVIDER = True

# --- Helper function to check if critical configs are placeholders ---
def check_critical_configs():
    """Checks if critical API keys are still placeholders."""
    if NASDAQ_API_KEY == "YOUR_NASDAQ_API_KEY_HERE":
        print("WARNING: NASDAQ_API_KEY is a placeholder. Please set it in environment variables or config.py.")
    if ALPHA_VANTAGE_API_KEY == "YOUR_ALPHA_VANTAGE_API_KEY_HERE" and PRIMARY_DATA_PROVIDER == "alpha_vantage":
        print("WARNING: ALPHA_VANTAGE_API_KEY is a placeholder.")
    # Add checks for other keys or DB credentials if necessary
    if DB_USER == "your_db_user" or DB_PASSWORD == "your_db_password":
        print("WARNING: Database credentials (DB_USER, DB_PASSWORD) might be placeholders.")

if __name__ == "__main__":
    print("Configuration Loaded:")
    print(f"  NASDAQ_API_KEY: {'Set' if NASDAQ_API_KEY != 'YOUR_NASDAQ_API_KEY_HERE' else 'Placeholder!'}")
    print(f"  DB_NAME: {DB_NAME}")
    print(f"  DB_HOST: {DB_HOST}")
    check_critical_configs()
