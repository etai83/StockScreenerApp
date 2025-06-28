# etl/symbol_utils.py

import requests
from bs4 import BeautifulSoup

# Wikipedia URL for the list of S&P 500 companies
SP500_WIKI_URL = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'

def get_sp500_stocks_tickers_from_wiki() -> list[str]:
    """
    Scrapes S&P 500 company tickers from Wikipedia.
    Uses the table on the Wikipedia page for "List of S&P 500 companies".
    Returns a list of ticker symbols.
    """
    try:
        response = requests.get(SP500_WIKI_URL, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        response.raise_for_status() # Raise an exception for HTTP errors
    except requests.exceptions.RequestException as e:
        print(f"Error fetching S&P 500 list from Wikipedia: {e}")
        # Fallback or error handling:
        # Could return a cached list, a default list, or raise the error
        # For now, return empty list or raise to indicate failure
        return []

    soup = BeautifulSoup(response.text, 'lxml') # Using lxml parser

    # The first table on the page is usually the one with the S&P 500 components
    table = soup.find('table', {'id': 'constituents'}) # More specific table selection

    if not table:
        # Fallback if the specific ID is not found (Wikipedia structure might change)
        table = soup.find_all('table', class_='wikitable sortable')[0] if soup.find_all('table', class_='wikitable sortable') else None

    if not table:
        print("Error: Could not find the S&P 500 constituents table on Wikipedia page.")
        return []

    tickers = []
    for row in table.find_all('tr')[1:]: # Skip the header row
        cells = row.find_all('td')
        if cells and len(cells) > 0:
            # The ticker symbol is usually in the first cell
            ticker = cells[0].text.strip()
            # Wikipedia stock symbols sometimes contain dots (e.g., BRK.B), which yfinance handles.
            # Some symbols might need replacement (e.g. BF.B to BF-B for some APIs, but yfinance is usually fine)
            # For now, we assume tickers are directly usable by yfinance.
            if ticker: # Ensure ticker is not empty
                 tickers.append(ticker)

    if not tickers:
        print("Warning: No tickers extracted from Wikipedia table. The page structure might have changed.")

    return tickers

if __name__ == '__main__':
    print("Fetching S&P 500 tickers...")
    sp500_tickers = get_sp500_stocks_tickers_from_wiki()
    if sp500_tickers:
        print(f"Found {len(sp500_tickers)} tickers.")
        print("First 10 tickers:", sp500_tickers[:10])
        # Example: Check for a specific known ticker
        if "AAPL" in sp500_tickers:
            print("'AAPL' is in the list.")
        if "BRK.B" in sp500_tickers: # yfinance uses BRK-B or BRK.B
            print("'BRK.B' (or similar) is in the list.")
    else:
        print("Could not retrieve S&P 500 tickers.")
