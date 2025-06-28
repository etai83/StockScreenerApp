# Data Fetching Logic

import os
import requests
# from .config import NASDAQ_API_KEY, ALPHA_VANTAGE_API_KEY # Example

import time
import yfinance as yf # Added yfinance
from datetime import datetime

# Placeholder for actual API URLs
NASDAQ_API_URL = "https://data.nasdaq.com/api/v3/datatables/SHARADAR/SEP" # Example: Sharadar Equity Prices
ALPHA_VANTAGE_API_URL = "https://www.alphavantage.co/query"

# Configuration for retries
MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 1 # Initial wait time for backoff

def request_with_retry(url: str, params: dict, headers: dict = None, method: str = "GET", data=None):
    """
    Makes an HTTP request with retries and exponential backoff.
    """
    num_retries = 0
    backoff_seconds = INITIAL_BACKOFF_SECONDS
    last_exception = None

    while num_retries < MAX_RETRIES:
        try:
            print(f"Attempt {num_retries + 1} to fetch {url} with params {params}")
            if method.upper() == "GET":
                response = requests.get(url, params=params, headers=headers, timeout=10) # 10s timeout
            elif method.upper() == "POST":
                response = requests.post(url, params=params, headers=headers, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status() # Raises HTTPError for bad responses (4XX or 5XX)
            return response.json()
        except requests.exceptions.RequestException as e:
            last_exception = e
            print(f"Request failed (attempt {num_retries + 1}/{MAX_RETRIES}): {e}")
            num_retries += 1
            if num_retries < MAX_RETRIES:
                print(f"Waiting {backoff_seconds}s before retrying...")
                time.sleep(backoff_seconds)
                backoff_seconds *= 2 # Exponential backoff
            else:
                print("Max retries reached.")
                raise last_exception # Re-raise the last exception

def fetch_nasdaq_data(symbols: list[str]):
    """
    Fetches data for a list of symbols from Nasdaq Data Link.
    NOTE: This is a placeholder. Actual implementation will depend on the specific
    Nasdaq Data Link API endpoint and authentication mechanism.
    The PRD mentions "Nasdaq Data Link REST/Streaming".
    This function should ideally fetch data for all symbols in an efficient manner,
    possibly one API call for multiple symbols if supported, or batching calls.
    """
    print(f"Fetching data for {len(symbols)} symbols from Nasdaq Data Link...")
    api_key = os.getenv("NASDAQ_API_KEY") # Ensure this is set in your environment
    if not api_key:
        # In a real scenario, might fall back to config.py or raise critical error
        print("Warning: NASDAQ_API_KEY not found in environment. Using placeholder data.")
        return [{"symbol": symbol, "close": 150.00, "date": "2023-10-26", "api_source": "NasdaqMock"} for symbol in symbols]

    all_ticker_data = []
    for symbol in symbols:
        # This is a simplified example assuming one symbol per call.
        # Real Nasdaq APIs might offer batching or different structures.
        params = {
            "ticker": symbol,
            "qopts.columns": "date,open,high,low,close,volume", # Example columns
            "api_key": api_key
            # Add other necessary params like date ranges, etc.
        }
        try:
            # Using a generic request_with_retry helper
            data = request_with_retry(NASDAQ_API_URL, params=params)
            # Process 'data' here to fit the TickerMetrics structure or a common internal format.
            # The response format from Nasdaq Data Link will need to be mapped.
            # For now, let's assume data is a list of daily entries for the ticker.
            if data and isinstance(data, dict) and 'datatable' in data and 'data' in data['datatable']:
                # This is a guess based on some Nasdaq API structures. Adapt as needed.
                # Assuming the last entry is the most recent for 'close' price.
                # And historical data is needed for SMA, 52w high.
                # This part is highly dependent on the chosen Nasdaq endpoint.
                # For this placeholder, we'll just add a dummy entry.
                print(f"Successfully fetched data for {symbol} from Nasdaq.")
                # This mock processing is insufficient for real calculations.
                # A real implementation needs to get historical series for SMA, 52w high.
                all_ticker_data.append({"symbol": symbol, "close": 155.00, "date": "2023-10-27", "raw_nasdaq_data": data, "api_source": "Nasdaq"})
            else:
                 print(f"Unexpected data format for {symbol} from Nasdaq or no data.")
                 all_ticker_data.append({"symbol": symbol, "error": "FormatError", "api_source": "Nasdaq"})

        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch data for {symbol} from Nasdaq after retries: {e}")
            all_ticker_data.append({"symbol": symbol, "error": str(e), "api_source": "Nasdaq"})
        except Exception as e: # Catch other potential errors during fetch/processing
            print(f"An unexpected error occurred for {symbol} with Nasdaq: {e}")
            all_ticker_data.append({"symbol": symbol, "error": f"Unexpected: {str(e)}", "api_source": "Nasdaq"})

    # This should return a list of dictionaries or objects,
    # where each contains enough info for calculations.py (e.g., historical prices).
    # The current return is still too simplistic for real calculations.
    return all_ticker_data if all_ticker_data else [{"symbol": s, "error": "NoData", "api_source": "Nasdaq"} for s in symbols]


def fetch_latest_closing_prices_for_symbols(symbols: list[str]) -> list[dict]:
    """
    Fetches the latest available closing price for a list of symbols using yfinance.
    Returns a list of dictionaries: {'symbol': str, 'lastPrice': float, 'priceDate': str_iso_date}
    or {'symbol': str, 'error': str} if fetching fails for a symbol.
    """
    print(f"Fetching latest closing prices for {len(symbols)} symbols using yfinance...")
    results = []
    for symbol in symbols:
        try:
            ticker = yf.Ticker(symbol)
            # Fetch history for the last 2 trading days to reliably get the most recent close
            # yfinance returns data with Date as index (timezone-aware)
            hist = ticker.history(period="2d", auto_adjust=True, prepost=False)

            if not hist.empty:
                latest_data = hist.iloc[-1] # Get the last row
                close_price = latest_data['Close']
                price_date = latest_data.name.strftime('%Y-%m-%d') # .name is the DatetimeIndex value

                results.append({
                    "symbol": symbol,
                    "lastPrice": round(float(close_price), 4), # Ensure float and round
                    "priceDate": price_date
                })
                # print(f"Successfully fetched closing price for {symbol}: {close_price} on {price_date}")
            else:
                print(f"No historical data found for {symbol} with yfinance.")
                results.append({"symbol": symbol, "error": "NoDataFound"})
        except Exception as e:
            print(f"Error fetching data for {symbol} with yfinance: {e}")
            results.append({"symbol": symbol, "error": str(e)})
        time.sleep(0.1) # Small delay to be polite to the API, yfinance might handle rate limits too

    return results


def fetch_alpha_vantage_data(symbols: list[str]):
    """
    Fetches data for a list of symbols from Alpha Vantage.
    (Backup provider)
    """
    print(f"Fetching data for {len(symbols)} symbols from Alpha Vantage...")
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not api_key:
        print("Warning: ALPHA_VANTAGE_API_KEY not found. Using placeholder data for Alpha Vantage.")
        return [{"symbol": symbol, "close": 140.00, "date": "2023-10-26", "api_source": "AlphaMock"} for symbol in symbols]
    #
    # Example:
    # params = {
    #     "function": "TIME_SERIES_DAILY_ADJUSTED",
    #     "symbol": "IBM",
    #     "apikey": api_key,
    # }
    # response = requests.get(ALPHA_VANTAGE_API_URL, params=params)
    # response.raise_for_status()
    # data = response.json()
    print("Placeholder: Alpha Vantage data fetched.")
    return [{"symbol": symbol, "close": 150.00, "date": "2023-10-26"} for symbol in symbols] # Dummy data

if __name__ == '__main__':
    # Example usage (for testing)
    sample_symbols = ["AAPL", "MSFT"]
    nasdaq_data = fetch_nasdaq_data(sample_symbols)
    # alpha_data = fetch_alpha_vantage_data(sample_symbols)
    print("\nSample Nasdaq Data:")
    for item in nasdaq_data:
        print(item)
    # print("\nSample Alpha Vantage Data:")
    # for item in alpha_data:
    # print(item)
