# Financial Calculations Logic
import pandas as pd

def calculate_sma(prices: list[float], window: int) -> float | None:
    """
    Calculates the Simple Moving Average (SMA) for a given window.

    >>> calculate_sma([10, 11, 12, 13, 14], 3)
    13.0
    >>> calculate_sma([10, 11], 3) is None
    True
    >>> calculate_sma([], 3) is None
    True
    >>> calculate_sma([10, 11, 12], 0) is None # Window must be positive
    True
    """
    if not prices or len(prices) < window or window <= 0:
        return None
    return sum(prices[-window:]) / window

def calculate_sma_pandas(series: pd.Series, window: int) -> float | None:
    """
    Calculates SMA using pandas Series, returns the last SMA value.
    (Requires pandas installed to test properly)
    """
    if series is None or len(series) < window:
        return None
    sma = series.rolling(window=window).mean()
    return sma.iloc[-1] if not sma.empty else None


def calculate_52_week_high(daily_high_prices: list[float]) -> float | None:
    """
    Calculates the 52-week high from a list of daily high prices.
    Assumes the list contains daily highs for at least the last 52 weeks (approx 252 trading days).

    >>> calculate_52_week_high([10, 20, 5, 25, 15]) # Simple case, less than 252 days
    25.0
    >>> calculate_52_week_high([]) is None
    True
    >>> calculate_52_week_high(list(range(300))) # More than 252 days
    299.0
    """
    if not daily_high_prices:
        return None
    # Consider the last 252 trading days for a 52-week period
    relevant_prices = daily_high_prices[-252:] # Slicing handles lists shorter than 252 correctly
    if not relevant_prices: # Should not happen if daily_high_prices was not empty
        return None
    return max(relevant_prices)

def calculate_52_week_high_pandas(daily_high_series: pd.Series) -> float | None:
    """
    Calculates 52-week high using pandas Series.
    (Requires pandas installed to test properly)
    """
    if daily_high_series is None or daily_high_series.empty:
        return None
    # Consider the last 252 trading days
    relevant_series = daily_high_series.iloc[-252:] # Slicing handles series shorter than 252
    if relevant_series.empty:
        return None
    return relevant_series.max()


def calculate_percentage_change_vs_sma150(close_price: float, sma150: float | None) -> float | None:
    """
    Calculates pct_vs_sma150 = (close - sma150) / sma150 * 100

    >>> calculate_percentage_change_vs_sma150(110, 100)
    10.0
    >>> calculate_percentage_change_vs_sma150(95, 100)
    -5.0
    >>> calculate_percentage_change_vs_sma150(100, None) is None
    True
    >>> calculate_percentage_change_vs_sma150(100, 0) is None # Avoid division by zero
    True
    """
    if sma150 is None or sma150 == 0: # Avoid division by zero
        return None
    return ((close_price - sma150) / sma150) * 100

def calculate_percentage_change_vs_52w_high(close_price: float, high52w: float | None) -> float | None:
    """
    Calculates pct_vs_52w = (close - 52w_high) / 52w_high * 100

    >>> calculate_percentage_change_vs_52w_high(190, 200)
    -5.0
    >>> calculate_percentage_change_vs_52w_high(200, 200)
    0.0
    >>> calculate_percentage_change_vs_52w_high(200, None) is None
    True
    >>> calculate_percentage_change_vs_52w_high(200, 0) is None
    True
    """
    if high52w is None or high52w == 0: # Avoid division by zero
        return None
    return ((close_price - high52w) / high52w) * 100

def process_ticker_data(historical_data: list[dict], current_close: float) -> dict | None:
    """
    Processes historical data for a single ticker to calculate all required metrics.
    'historical_data' is a list of dicts, e.g., [{'date': 'YYYY-MM-DD', 'close': 100.0, 'high': 102.0}, ...]
    It should be sorted by date in ascending order.
    'current_close' is the most recent closing price to be used for % change calculations.
    """
    if not historical_data:
        return None

    # Using pandas for easier rolling calculations if available and appropriate
    # For simplicity here, I'll use list-based calculations first, then show pandas alternatives

    # Ensure data has 'close' and 'high' keys
    if not all('close' in day and 'high' in day for day in historical_data):
        print("Warning: Historical data is missing 'close' or 'high' keys.")
        return None

    close_prices = [day['close'] for day in historical_data]
    high_prices = [day['high'] for day in historical_data]

    # SMA150
    sma150 = calculate_sma(close_prices, 150)

    # 52-Week High
    # For 52-week high, we'd typically use daily high prices.
    # The input `historical_data` should contain daily highs.
    high_52w = calculate_52_week_high(high_prices)

    # Percentage changes
    pct_vs_sma150 = calculate_percentage_change_vs_sma150(current_close, sma150)
    pct_vs_52w_high = calculate_percentage_change_vs_52w_high(current_close, high_52w)

    return {
        "lastPrice": current_close,
        "sma150": sma150,
        "hi52w": high_52w,
        "pctVsSma150": pct_vs_sma150,
        "pctVs52w": pct_vs_52w_high,
    }

# Example usage (for testing)
if __name__ == '__main__':
    # Sample historical data for a ticker (e.g., 200 days)
    # In a real scenario, this would come from the data_fetcher
    sample_history = []
    base_price = 100
    for i in range(200):
        price = base_price + (i % 10) - 5 + (i / 20) # Some variation
        high = price + 2
        sample_history.append({'date': f'2023-{ (i//30)+1:02d}-{ (i%30)+1:02d}', 'close': price, 'high': high})

    current_close_price = sample_history[-1]['close']

    print(f"Sample history length: {len(sample_history)} days")
    print(f"Current close price: {current_close_price}")

    metrics = process_ticker_data(sample_history, current_close_price)

    if metrics:
        print("\nCalculated Metrics:")
        print(f"  Last Price: {metrics['lastPrice']:.2f}")
        print(f"  SMA150: {metrics['sma150']:.2f}" if metrics['sma150'] is not None else "  SMA150: N/A")
        print(f"  52-Week High: {metrics['hi52w']:.2f}" if metrics['hi52w'] is not None else "  52-Week High: N/A")
        print(f"  % vs SMA150: {metrics['pctVsSma150']:.2f}%" if metrics['pctVsSma150'] is not None else "  % vs SMA150: N/A")
        print(f"  % vs 52w High: {metrics['pctVs52w']:.2f}%" if metrics['pctVs52w'] is not None else "  % vs 52w High: N/A")

    # Pandas example (requires pandas installed)
    try:
        df = pd.DataFrame(sample_history)
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date')

        sma150_pd = calculate_sma_pandas(df['close'], 150)
        hi52w_pd = calculate_52_week_high_pandas(df['high'])

        pct_vs_sma150_pd = calculate_percentage_change_vs_sma150(current_close_price, sma150_pd)
        pct_vs_52w_high_pd = calculate_percentage_change_vs_52w_high(current_close_price, hi52w_pd)

        print("\nCalculated Metrics (Pandas):")
        print(f"  SMA150 (Pandas): {sma150_pd:.2f}" if sma150_pd is not None else "  SMA150 (Pandas): N/A")
        print(f"  52-Week High (Pandas): {hi52w_pd:.2f}" if hi52w_pd is not None else "  52-Week High (Pandas): N/A")
        print(f"  % vs SMA150 (Pandas): {pct_vs_sma150_pd:.2f}%" if pct_vs_sma150_pd is not None else "  % vs SMA150 (Pandas): N/A")
        print(f"  % vs 52w High (Pandas): {pct_vs_52w_high_pd:.2f}%" if pct_vs_52w_high_pd is not None else "  % vs 52w High (Pandas): N/A")

    except ImportError:
        print("\nPandas not installed, skipping pandas example.")
    except Exception as e:
        print(f"\nError in pandas example: {e}")
