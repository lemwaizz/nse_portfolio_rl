"""
data/database.py
Query layer: fetches NSE data from PostgreSQL and returns numpy arrays.
Imported by the environment, training callbacks, and evaluation notebooks.
"""
import os, logging
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
log = logging.getLogger(__name__)

DB_URL = (
    f"postgresql://{os.getenv('DB_USER','postgres')}:"
    f"{os.getenv('DB_PASSWORD','nse_password')}@"
    f"{os.getenv('DB_HOST','localhost')}:"
    f"{os.getenv('DB_PORT','5432')}/"
    f"{os.getenv('DB_NAME','nse_portfolio')}"
)

# 67 qualifying equities — sorted alphabetically.
# This order is the contract between all files.
# Stock i in ALL_TICKERS = column i in every (T, N) numpy array.
ALL_TICKERS = sorted([
    "ABSA","ARM","BAMB","BAT","BKG","BOC","BRIT","CABL","CARB","CGEN",
    "CIC","COOP","CRWN","CTUM","DCON","DTK","EABL","EGAD","EQTY","EVRD",
    "FAHR","FTGH","GLD","HAFR","HBE","HFCK","IMH","JUB","KAPC","KCB",
    "KEGN","KNRE","KPLC","KPLC-P4","KPLC-P7","KQ","KUKZ","KURV","LAPR",
    "LBTY","LIMT","LKL","MSC","NBK","NBV","NCBA","NMG","NSE","OCH",
    "ORCH","PORT","SASN","SBIC","SCAN","SCBK","SCOM","SGL","SLAM","SMER",
    "TCL","TOTL","TPSE","UCHM","UMME","UNGA","WTK","XPRS",
])
N_STOCKS = len(ALL_TICKERS)  # 67

PERIODS = {
    "train": ("2007-01-01", "2017-12-31"),
    "val":   ("2018-01-01", "2020-12-31"),
    "test1": ("2021-01-01", "2022-12-31"),
    "test2": ("2023-01-01", "2025-12-31"),
    "all":   ("2007-01-01", "2025-12-31"),
}


class NSEDatabase:
    """
    Fetches all prices and features for a walk-forward period.
    Returns (T, N) numpy float32 arrays where T = trading days, N = 67 stocks.
    Caches results so the database is queried at most once per period per session.
    """

    def __init__(self):
        self.engine  = create_engine(DB_URL, pool_pre_ping=True)
        self._cache: dict = {}

    def get_period(self, period: str) -> dict:
        if period in self._cache:
            return self._cache[period]
        if period not in PERIODS:
            raise ValueError(f"Unknown period '{period}'. Choose: {list(PERIODS)}")

        start, end = PERIODS[period]
        log.info("[DB] Loading '%s' (%s to %s) ...", period, start, end)

        with self.engine.connect() as conn:
            pdf = pd.read_sql(text("""
                SELECT date, ticker, adj_close, high, low, volume
                FROM   nse_prices
                WHERE  ticker = ANY(:t) AND date BETWEEN :s AND :e
                  AND  adj_close IS NOT NULL AND adj_close > 0
                ORDER  BY date, ticker
            """), conn, params={"t": ALL_TICKERS, "s": start, "e": end})

            fdf = pd.read_sql(text("""
                SELECT date, ticker,
                       return_1d, return_5d, return_20d, return_60d,
                       vol_20d, cs_spread, amihud
                FROM   nse_features
                WHERE  ticker = ANY(:t) AND date BETWEEN :s AND :e
                ORDER  BY date, ticker
            """), conn, params={"t": ALL_TICKERS, "s": start, "e": end})

        if pdf.empty:
            raise RuntimeError(
                f"No price data for period '{period}'. "
                "Run 01_load_database.ipynb first."
            )

        dates = sorted(pdf["date"].unique())
        T     = len(dates)

        def _pivot(df, col, fill=0.0) -> np.ndarray:
            return (
                df.pivot(index="date", columns="ticker", values=col)
                  .reindex(index=dates, columns=ALL_TICKERS)
                  .fillna(fill).values.astype(np.float32)
            )

        pdf["_av"] = 1.0
        prices = _pivot(pdf, "adj_close", np.nan)

        # Forward-fill any remaining NaN prices within each stock column
        for j in range(N_STOCKS):
            col  = prices[:, j]
            mask = np.isnan(col)
            if mask.any():
                idx = np.where(~mask)[0]
                if len(idx) > 0:
                    col[mask] = np.interp(np.where(mask)[0], idx, col[idx])

        result = {
            "prices":       prices,
            "highs":        _pivot(pdf, "high",      np.nan),
            "lows":         _pivot(pdf, "low",       np.nan),
            "volumes":      _pivot(pdf, "volume",    0.0),
            "availability": _pivot(pdf, "_av",       0.0),
            "return_1d":    _pivot(fdf, "return_1d",  0.0),
            "return_5d":    _pivot(fdf, "return_5d",  0.0),
            "return_20d":   _pivot(fdf, "return_20d", 0.0),
            "return_60d":   _pivot(fdf, "return_60d", 0.0),
            "vol_20d":      _pivot(fdf, "vol_20d",    0.0),
            "cs_spread":    _pivot(fdf, "cs_spread",  0.0),
            "amihud":       _pivot(fdf, "amihud",     0.0),
            "dates":        [str(d) for d in dates],
            "tickers":      ALL_TICKERS,
            "T":            T,
            "N":            N_STOCKS,
        }
        self._cache[period] = result
        log.info("[DB] '%s': %d days x %d stocks", period, T, N_STOCKS)
        return result


# Singleton: all environment instances share one connection and one cache
_instance: NSEDatabase = None

def get_db() -> NSEDatabase:
    global _instance
    if _instance is None:
        _instance = NSEDatabase()
    return _instance