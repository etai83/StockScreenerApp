# ETL Process for NASDAQ Stock Screener

## Overview

This directory contains the Python scripts responsible for the Extract, Transform, and Load (ETL) process for the NASDAQ Stock Screener Dashboard. The goal is to fetch stock data from providers, calculate key financial metrics, and store them in a database for the frontend API to consume.

**Current Status:** The ETL scripts are structured conceptually. Calculation logic for financial metrics is implemented. However, data fetching from live APIs and interaction with a real database are currently placeholders. The scripts do not perform live data operations in their present state.

## Modules

*   **`main.py`**:
    *   The main entry point to orchestrate the entire ETL flow.
    *   (Conceptual) It would typically:
        1.  Load configuration (API keys, DB credentials, symbol lists).
        2.  Call `data_fetcher.py` to get raw stock data.
        3.  For each stock, pass historical data to `calculations.py` to compute metrics.
        4.  Call `db_manager.py` to store the calculated `TickerMetrics` into the database.
        5.  Log the process and handle errors.
*   **`data_fetcher.py`**:
    *   Responsible for fetching raw financial data from external APIs.
    *   Primary provider: Nasdaq Data Link (conceptual).
    *   Backup provider: Alpha Vantage or Finnhub (conceptual).
    *   Includes conceptual logic for retries with exponential backoff for API requests.
    *   Currently returns placeholder/mock data.
    *   **New**: Includes `fetch_latest_closing_prices_for_symbols` using `yfinance` to get recent prices for a list of symbols.
*   **`calculations.py`**:
    *   Contains functions to calculate financial metrics based on raw data:
        *   150-day Simple Moving Average (SMA150).
        *   52-week high.
        *   Percentage difference from SMA150 (`pctVsSma150`).
        *   Percentage difference from 52-week high (`pctVs52w`).
    *   Includes docstring tests for these calculation functions.
*   **`db_manager.py`**:
    *   Manages interactions with the PostgreSQL database (intended to use TimescaleDB extension).
    *   Includes functions for:
        *   Establishing a database connection.
        *   Creating the `ticker_metrics` table (idempotent, conceptual TimescaleDB hypertable conversion).
        *   Storing (upserting) `TickerMetrics` data.
        *   **New**: `update_stock_prices` function to specifically update latest prices for symbols by creating new timestamped records.
    *   Currently, database operations are placeholders and do not execute against a live database.
*   **`symbol_utils.py` (New)**:
    *   Utilities for fetching lists of stock symbols.
    *   Includes `get_sp500_stocks_tickers_from_wiki` to scrape S&P 500 tickers from Wikipedia.
*   **`config.py`**:
    *   Defines configuration settings, such as API keys, database connection parameters, and sample stock symbols.
    *   Emphasizes loading sensitive information from environment variables.
*   **`requirements.txt`**:
    *   Lists Python dependencies. **Updated** to include `yfinance`, `beautifulsoup4`, `lxml`.

## Setup and Running (Conceptual)

### 1. Prerequisites
*   Python 3.x
*   Access to a PostgreSQL database (with TimescaleDB extension ideally).
*   API keys for data providers (Nasdaq Data Link, Alpha Vantage, etc.).

### 2. Environment Setup
1.  Navigate to the `etl` directory:
    ```bash
    cd path/to/nasdaq-stock-screener/etl
    ```
2.  Create a Python virtual environment (recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Set required environment variables (see `config.py` for a list):
    *   `NASDAQ_API_KEY="your_nasdaq_key"`
    *   `ALPHA_VANTAGE_API_KEY="your_alpha_vantage_key"`
    *   `DB_NAME="your_db_name"`
    *   `DB_USER="your_db_user"`
    *   `DB_PASSWORD="your_db_password"`
    *   `DB_HOST="your_db_host"`
    *   `DB_PORT="your_db_port"`

### 3. Running the ETL Process (Conceptual)
Once the environment is set up and configured, the main ETL script can be run with different arguments:
```bash
# To run the S&P 500 latest price sync:
python main.py --sync-sp500

# To run the (conceptual) full ETL for NASDAQ_SYMBOLS_SAMPLE:
# python main.py --full-etl

# To initialize the database (create tables if they don't exist):
# python main.py --init-db
```
**Note:** In its current state, these commands will execute the implemented logic (e.g., S&P 500 sync will attempt to fetch from Wikipedia and yfinance) but database operations are against a mock/non-existent DB. The full ETL is a placeholder.

### 4. Running Docstring Tests for Calculations
To verify the calculation logic:
```bash
python -m doctest calculations.py
```

## Future Development
*   Implement live API calls in `data_fetcher.py` for Nasdaq Data Link and backup providers, including robust error handling and data parsing.
*   Connect `db_manager.py` to a real PostgreSQL/TimescaleDB instance.
*   Fully develop `main.py` to orchestrate the complete ETL pipeline, including fetching the full NASDAQ common stock universe.
*   Implement proper logging throughout the ETL process.
*   Containerize the ETL application (e.g., using Docker) for deployment.
*   Set up scheduling (e.g., cron, AWS EventBridge) to run the ETL process every 60 minutes as per PRD.
```
