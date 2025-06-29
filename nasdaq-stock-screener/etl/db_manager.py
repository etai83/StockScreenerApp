# Database Management Logic (PostgreSQL with TimescaleDB)

import os
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
# from .config import DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT # Example

# --- Database Connection ---
def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME", "nasdaq_screener_db"),
            user=os.getenv("DB_USER", "user"),
            password=os.getenv("DB_PASSWORD", "password"),
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432")
        )
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to the database: {e}")
        # In a real ETL, might want to retry or raise a critical error
        raise

# --- Schema Initialization ---
# PRD Data Model:
# type TickerMetrics = {
#   symbol: string;
#   lastPrice: number;
#   sma150: number;
#   hi52w: number;
#   pctVsSma150: number;   // signed %
#   pctVs52w:  number;     // signed %
#   updatedAt: Date;       // ISO-8601
# };

TABLE_NAME = "ticker_metrics"

def create_ticker_metrics_table(conn):
    """
    Creates the ticker_metrics table if it doesn't exist.
    This table will store the calculated metrics for each ticker.
    For TimescaleDB, we'd typically make `updatedAt` the time dimension.
    """
    create_table_sql = f"""
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        updatedAt TIMESTAMPTZ NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        lastPrice NUMERIC(12, 4),
        sma150 NUMERIC(12, 4),
        hi52w NUMERIC(12, 4),
        pctVsSma150 NUMERIC(8, 4),
        pctVs52w NUMERIC(8, 4),
        PRIMARY KEY (updatedAt, symbol)
    );
    """
    # TimescaleDB hypertable (optional, depends on query patterns and data volume)
    # For high-frequency updates or historical analysis, TimescaleDB is beneficial.
    # If this table only stores the *latest* snapshot, a regular PG table might be fine,
    # but TimescaleDB is specified in the PRD for daily bars & derived fields.
    # This table stores derived fields, so TimescaleDB makes sense.
    create_hypertable_sql = f"""
    SELECT create_hypertable('{TABLE_NAME}', 'updatedAt', if_not_exists => TRUE);
    """
    try:
        with conn.cursor() as cur:
            cur.execute(create_table_sql)
            # Check if TimescaleDB extension is available before trying to create hypertable
            cur.execute("SELECT 1 FROM pg_extension WHERE extname = 'timescaledb' LIMIT 1;")
            if cur.fetchone():
                cur.execute(create_hypertable_sql)
                print(f"Table '{TABLE_NAME}' created and configured as TimescaleDB hypertable.")
            else:
                print(f"Table '{TABLE_NAME}' created (TimescaleDB extension not found, created as regular table).")
            conn.commit()
    except psycopg2.Error as e:
        print(f"Error creating table '{TABLE_NAME}': {e}")
        conn.rollback()
        raise

def initialize_database():
    """Initializes the database: connects and creates tables."""
    print("Initializing database...")
    try:
        conn = get_db_connection()
        create_ticker_metrics_table(conn)
        conn.close()
        print("Database initialization complete.")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        # Depending on policy, might want to exit or continue without DB
        raise

# --- Data Storage ---
def store_ticker_metrics(conn, metrics_data: list[dict]):
    """
    Stores a list of ticker metrics into the database.
    `metrics_data` is a list of dictionaries, where each dict conforms to TickerMetrics.
    Example: [{'symbol': 'AAPL', 'lastPrice': 150.0, ..., 'updatedAt': datetime_obj}, ...]
    """
    if not metrics_data:
        print("No metrics data to store.")
        return

    insert_sql = f"""
    INSERT INTO {TABLE_NAME} (updatedAt, symbol, lastPrice, sma150, hi52w, pctVsSma150, pctVs52w)
    VALUES %s
    ON CONFLICT (updatedAt, symbol) DO UPDATE SET
        lastPrice = EXCLUDED.lastPrice,
        sma150 = EXCLUDED.sma150,
        hi52w = EXCLUDED.hi52w,
        pctVsSma150 = EXCLUDED.pctVsSma150,
        pctVs52w = EXCLUDED.pctVs52w;
    """

    # Prepare data for execute_values: list of tuples
    # Ensure 'updatedAt' is a datetime object if not already
    values_to_insert = []
    for record in metrics_data:
        updated_at = record.get('updatedAt')
        if isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
        elif not isinstance(updated_at, datetime):
            updated_at = datetime.now() # Fallback, though ideally it's set properly earlier

        values_to_insert.append((
            updated_at,
            record.get('symbol'),
            record.get('lastPrice'),
            record.get('sma150'),
            record.get('hi52w'),
            record.get('pctVsSma150'),
            record.get('pctVs52w')
        ))

    try:
        with conn.cursor() as cur:
            execute_values(cur, insert_sql, values_to_insert)
            conn.commit()
            print(f"Successfully stored/updated {len(values_to_insert)} records in '{TABLE_NAME}'.")
    except psycopg2.Error as e:
        print(f"Error storing ticker metrics: {e}")
        conn.rollback()
        # Potentially re-raise or handle more gracefully
        raise

# --- Data Retrieval (Example - might be more API-focused) ---
def get_latest_metrics_for_symbol(conn, symbol: str) -> dict | None:
    """Retrieves the most recent metrics for a given symbol."""
    query_sql = f"""
    SELECT symbol, lastPrice, sma150, hi52w, pctVsSma150, pctVs52w, updatedAt
    FROM {TABLE_NAME}
    WHERE symbol = %s
    ORDER BY updatedAt DESC
    LIMIT 1;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query_sql, (symbol,))
            record = cur.fetchone()
            if record:
                columns = [desc[0] for desc in cur.description]
                return dict(zip(columns, record))
            return None
    except psycopg2.Error as e:
        print(f"Error retrieving metrics for {symbol}: {e}")
        return None

if __name__ == '__main__':
    # Example Usage (requires a running PostgreSQL instance)
    # Set DB_ environment variables or update get_db_connection()
    print("Running DB Manager examples (ensure PostgreSQL is running and configured)...")
    try:
        initialize_database() # Create table if not exists

        # Example data to store
        now = datetime.now()
        sample_metrics = [
            {
                'symbol': 'AAPL', 'lastPrice': 170.50, 'sma150': 165.20, 'hi52w': 190.80,
                'pctVsSma150': (170.50 - 165.20) / 165.20 * 100,
                'pctVs52w': (170.50 - 190.80) / 190.80 * 100,
                'updatedAt': now
            },
            {
                'symbol': 'MSFT', 'lastPrice': 330.10, 'sma150': 320.90, 'hi52w': 350.00,
                'pctVsSma150': (330.10 - 320.90) / 320.90 * 100,
                'pctVs52w': (330.10 - 350.00) / 350.00 * 100,
                'updatedAt': now
            }
        ]

        conn = get_db_connection()
        store_ticker_metrics(conn, sample_metrics)

        # Retrieve and print
        for sym in ['AAPL', 'GOOGL']: # GOOGL won't be found yet
            data = get_latest_metrics_for_symbol(conn, sym)
            if data:
                print(f"\nLatest data for {sym}:")
                for key, val in data.items():
                    print(f"  {key}: {val}")
            else:
                print(f"\nNo data found for {sym}.")

        conn.close()

    except psycopg2.OperationalError:
        print("Could not connect to PostgreSQL. Please ensure it's running and accessible.")
    except Exception as e:
        print(f"An error occurred during db_manager example: {e}")


def update_stock_prices(conn, price_updates: list[dict]):
    """
    Updates stock prices in the database.
    For each symbol in price_updates, it fetches the most recent existing record,
    updates its lastPrice with the new price, sets updatedAt to now,
    and then re-inserts/upserts this complete record using store_ticker_metrics.

    `price_updates` is a list of dicts: [{'symbol': str, 'lastPrice': float, 'priceDate': str_iso_date}, ...]
    Note: 'priceDate' from the input is logged but not directly used as 'updatedAt' for the new record.
          'updatedAt' for the new record will be the current timestamp.
    """
    if not price_updates:
        print("No price updates to process.")
        return

    print(f"Processing {len(price_updates)} price updates...")
    records_to_store = []
    now_timestamp = datetime.now()

    for update in price_updates:
        symbol = update.get('symbol')
        new_price = update.get('lastPrice')
        price_date_str = update.get('priceDate') # Date of the price from source

        if not symbol or new_price is None:
            print(f"Skipping invalid price update entry: {update}")
            continue

        # 1. Fetch the most recent complete record for this symbol
        latest_record_for_symbol = get_latest_metrics_for_symbol(conn, symbol)

        if latest_record_for_symbol:
            # Create a new record based on the old one, updating price and timestamp
            updated_record = {
                "symbol": symbol,
                "lastPrice": new_price,
                "sma150": latest_record_for_symbol.get('sma150'),
                "hi52w": latest_record_for_symbol.get('hi52w'),
                "pctVsSma150": None, # Will need recalculation
                "pctVs52w": None,    # Will need recalculation
                "updatedAt": now_timestamp
            }
            # Recalculate percentages if possible (or mark for later recalculation)
            if updated_record["sma150"] is not None:
                updated_record["pctVsSma150"] = ((new_price - updated_record["sma150"]) / updated_record["sma150"]) * 100 if updated_record["sma150"] != 0 else None
            if updated_record["hi52w"] is not None:
                 # 52-week high might also need update if new_price is higher, but that requires historical data.
                 # For this simple update, we assume hi52w from previous record is still relevant or updated by full ETL.
                 # If new_price > hi52w, then hi52w should become new_price.
                if new_price > updated_record["hi52w"]:
                    updated_record["hi52w"] = new_price # Update 52w high if current price beats it
                updated_record["pctVs52w"] = ((new_price - updated_record["hi52w"]) / updated_record["hi52w"]) * 100 if updated_record["hi52w"] != 0 else None

            records_to_store.append(updated_record)
            print(f"Prepared update for {symbol}: New Price ${new_price} (Price Date: {price_date_str}, UpdatedAt: {now_timestamp.isoformat()})")
        else:
            # If no existing record, we can't just update price.
            # We'd need a full data fetch for this new symbol or insert with many nulls.
            # For a "price update" feature, we typically assume the symbol exists.
            # Alternatively, insert a partial record if schema allows (it doesn't for NOT NULL if any).
            # For now, we'll create a new record with available data, others null.
            # This also requires recalculation of percentages if we want them.
            new_partial_record = {
                "symbol": symbol,
                "lastPrice": new_price,
                "sma150": None,
                "hi52w": new_price, # If it's a new stock, its own price is its 52w high/low initially
                "pctVsSma150": None,
                "pctVs52w": 0.0, # Price is at its own 52w high
                "updatedAt": now_timestamp
            }
            records_to_store.append(new_partial_record)
            print(f"Prepared new partial record for {symbol} (not previously tracked): Price ${new_price} (Price Date: {price_date_str}, UpdatedAt: {now_timestamp.isoformat()})")

    if records_to_store:
        try:
            store_ticker_metrics(conn, records_to_store) # Use existing function to upsert
            print(f"Successfully processed and stored/updated {len(records_to_store)} price updates.")
        except Exception as e:
            print(f"Error during storing price updates: {e}")
            # Handle or re-raise
    else:
        print("No valid records were prepared for price update storage.")
