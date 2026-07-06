-- NSE DRL Portfolio Management — PostgreSQL Schema
-- Run once after starting Docker:
--   docker exec -i nse_db psql -U postgres -d nse_portfolio < data/schema.sql

-- Master catalogue of all stocks we track
CREATE TABLE IF NOT EXISTS nse_stocks (
    ticker      VARCHAR(15)   PRIMARY KEY,
    name        VARCHAR(150)  NOT NULL,
    sector      VARCHAR(60),
    data_rows   INTEGER       DEFAULT 0,
    first_date  DATE,
    last_date   DATE,
    is_active   BOOLEAN       DEFAULT TRUE,
    created_at  TIMESTAMP     DEFAULT NOW()
);

-- Daily price data — one row per stock per trading day (~500k rows total)
CREATE TABLE IF NOT EXISTS nse_prices (
    id          SERIAL        PRIMARY KEY,
    date        DATE          NOT NULL,
    ticker      VARCHAR(15)   NOT NULL,
    name        VARCHAR(150),
    high        NUMERIC(14,4),
    low         NUMERIC(14,4),
    close       NUMERIC(14,4) NOT NULL,
    adj_close   NUMERIC(14,4),
    volume      BIGINT,
    high_52w    NUMERIC(14,4),
    low_52w     NUMERIC(14,4),
    prev_close  NUMERIC(14,4),
    change_val  NUMERIC(10,4),
    change_pct  NUMERIC(8,4),
    created_at  TIMESTAMP     DEFAULT NOW()
);
-- Composite unique index: prevents duplicates AND speeds up date-range queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_dt ON nse_prices (date, ticker);
CREATE        INDEX IF NOT EXISTS idx_prices_t  ON nse_prices (ticker);
CREATE        INDEX IF NOT EXISTS idx_prices_d  ON nse_prices (date);

-- Pre-computed RL observation features — one row per stock per trading day
--
-- OBSERVATION VECTOR LAYOUT (8 features x 67 stocks = 536 dimensions):
--   Block 0  [0:67]    return_1d    1-day log return
--   Block 1  [67:134]  return_5d    5-day log return (weekly momentum)
--   Block 2  [134:201] return_20d   20-day log return (monthly momentum)
--   Block 3  [201:268] return_60d   60-day log return (quarter trend)
--   Block 4  [268:335] vol_20d      20-day rolling volatility
--   Block 5  [335:402] cs_spread    Corwin-Schultz bid-ask spread estimate
--   Block 6  [402:469] amihud       Amihud illiquidity ratio
--   Block 7  [469:536] weight       current portfolio weight (computed live by env)
--
-- WHY return_60d MATTERS FOR SHARPE:
--   NSE round-trip cost = 4.16%.
--   Breakeven: position must earn > 4.16% to justify entry + exit.
--   At 0.07%/day over 60 days = 4.2% cumulative -- just above breakeven.
--   An agent reading return_60d can gauge whether a position is worth its cost.
CREATE TABLE IF NOT EXISTS nse_features (
    date        DATE          NOT NULL,
    ticker      VARCHAR(15)   NOT NULL,
    return_1d   NUMERIC(12,8),
    return_5d   NUMERIC(12,8),
    return_20d  NUMERIC(12,8),
    return_60d  NUMERIC(12,8),
    vol_20d     NUMERIC(12,8),
    cs_spread   NUMERIC(12,8),
    amihud      NUMERIC(20,12),
    PRIMARY KEY (date, ticker)
);
CREATE INDEX IF NOT EXISTS idx_feat_t ON nse_features (ticker);
CREATE INDEX IF NOT EXISTS idx_feat_d ON nse_features (date);