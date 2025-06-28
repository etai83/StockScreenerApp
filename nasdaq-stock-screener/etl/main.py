# ETL Main Script
# This script will orchestrate the ETL process.

import sys
from datetime import datetime

# Assuming etl directory is in PYTHONPATH or scripts are run from project root
try:
    from .symbol_utils import get_sp500_stocks_tickers_from_wiki
    from .data_fetcher import fetch_latest_closing_prices_for_symbols #, fetch_nasdaq_data (for full ETL)
    from .calculations import process_ticker_data # (for full ETL)
    from .db_manager import get_db_connection, initialize_database, update_stock_prices #, store_ticker_metrics (for full ETL)
    from .config import NASDAQ_SYMBOLS_SAMPLE # (for full ETL)
except ImportError: # Fallback for running script directly within etl directory
    from symbol_utils import get_sp500_stocks_tickers_from_wiki
    from data_fetcher import fetch_latest_closing_prices_for_symbols #, fetch_nasdaq_data
    from calculations import process_ticker_data
    from db_manager import get_db_connection, initialize_database, update_stock_prices #, store_ticker_metrics
    from config import NASDAQ_SYMBOLS_SAMPLE


def run_full_etl():
    """
    Orchestrates the full ETL process for a predefined list of symbols (e.g., NASDAQ_SYMBOLS_SAMPLE).
    This function is a placeholder and needs full implementation for fetching historical data,
    calculating all metrics, and storing them.
    """
    print(f"[{datetime.now()}] Starting FULL ETL process...")
    # 1. Initialize DB (ensure tables exist)
    # initialize_database() # Better to do this once usually, or ensure it's idempotent

    # 2. Get symbols to process (e.g., from config or a dynamic source)
    symbols_to_process = NASDAQ_SYMBOLS_SAMPLE
    print(f"[{datetime.now()}] Processing {len(symbols_to_process)} symbols for full ETL.")

    # 3. Fetch comprehensive data for each symbol (historical for calculations)
    #    This part needs significant work in data_fetcher.py for the actual Nasdaq API
    #    raw_data_batch = fetch_nasdaq_data(symbols_to_process) # This needs to return historicals

    # 4. For each symbol's data:
    #    - Calculate all metrics (SMA150, 52w High, % changes) using calculations.py
    #      metrics_to_store = []
    #      for item in raw_data_batch:
    #          if 'error' not in item and item.get('raw_nasdaq_data'):
    #              # This assumes raw_nasdaq_data is a list of historical daily dicts
    #              # and item['close'] is the current close for that symbol.
    #              # This structure needs to be standardized from fetch_nasdaq_data.
    #              # For now, process_ticker_data expects historical_data and current_close.
    #              # This is a conceptual placeholder.
    #              # calculated_metrics = process_ticker_data(item['raw_nasdaq_data'], item['close'])
    #              # if calculated_metrics:
    #              #     metrics_to_store.append({
    #              #         "symbol": item['symbol'],
    #              #         **calculated_metrics,
    #              #         "updatedAt": datetime.now()
    #              #     })
    #              pass # Placeholder for actual processing

    # 5. Store calculated metrics in DB
    #    conn = None
    #    try:
    #        conn = get_db_connection()
    #        if metrics_to_store:
    #            store_ticker_metrics(conn, metrics_to_store)
    #    except Exception as e:
    #        print(f"[{datetime.now()}] Error during full ETL database operation: {e}")
    #    finally:
    #        if conn:
    #            conn.close()

    print(f"[{datetime.now()}] Placeholder: Full ETL process completed concept.")


def run_sp500_price_sync():
    """
    Runs a targeted sync for S&P 500 symbols to update their latest closing prices.
    """
    print(f"[{datetime.now()}] Starting S&P 500 latest price sync...")

    # 1. Get S&P 500 symbols
    sp500_symbols = get_sp500_stocks_tickers_from_wiki()
    if not sp500_symbols:
        print(f"[{datetime.now()}] Failed to retrieve S&P 500 symbol list. Aborting sync.")
        return
    print(f"[{datetime.now()}] Retrieved {len(sp500_symbols)} S&P 500 symbols.")

    # 2. Fetch latest closing prices for these symbols
    price_updates = fetch_latest_closing_prices_for_symbols(sp500_symbols)
    valid_price_updates = [p for p in price_updates if 'error' not in p]

    if not valid_price_updates:
        print(f"[{datetime.now()}] No valid price data fetched for S&P 500 symbols. Aborting database update.")
        return
    print(f"[{datetime.now()}] Fetched latest prices for {len(valid_price_updates)} S&P 500 symbols.")

    # 3. Update prices in the database
    conn = None
    try:
        # It's good practice to ensure DB is initialized, though this should be idempotent
        # initialize_database()
        conn = get_db_connection()
        update_stock_prices(conn, valid_price_updates)
        print(f"[{datetime.now()}] Database update process completed for S&P 500 prices.")
    except Exception as e:
        print(f"[{datetime.now()}] Error during S&P 500 price sync database operation: {e}")
    finally:
        if conn:
            conn.close()
            print(f"[{datetime.now()}] Database connection closed.")

    print(f"[{datetime.now()}] S&P 500 latest price sync process finished.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "--sync-sp500":
            run_sp500_price_sync()
        elif command == "--full-etl":
            print("Full ETL process is conceptual and not fully implemented yet.")
            # run_full_etl() # Uncomment when implemented
        elif command == "--init-db":
            print("Initializing database (if not already done)...")
            try:
                initialize_database()
                print("Database initialization attempt finished.")
            except Exception as e:
                print(f"Error initializing database: {e}")
        else:
            print(f"Unknown command: {command}")
            print("Usage: python main.py [--sync-sp500 | --full-etl | --init-db]")
    else:
        print("No command provided. Running S&P 500 Price Sync by default (for dev).")
        # Default action for development or if no args given
        run_sp500_price_sync()
        # print("Usage: python main.py [--sync-sp500 | --full-etl | --init-db]")
