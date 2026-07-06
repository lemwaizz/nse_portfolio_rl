import type { ColumnType } from "kysely";

export namespace StockDataDBSchemas {
  export type Generated<T> =
    T extends ColumnType<infer S, infer I, infer U>
      ? ColumnType<S, I | undefined, U>
      : ColumnType<T, T | undefined, T>;
  export type Timestamp = ColumnType<Date, Date | string, Date | string>;

  export type NseFeature = {
    date: Timestamp;
    ticker: string;
    return_1d: string | null;
    return_5d: string | null;
    return_20d: string | null;
    return_60d: string | null;
    vol_20d: string | null;
    cs_spread: string | null;
    amihud: string | null;
  };
  export type NsePrice = {
    id: Generated<number>;
    date: Timestamp;
    ticker: string;
    name: string | null;
    high: string | null;
    low: string | null;
    close: string;
    adj_close: string | null;
    volume: string | null;
    high_52w: string | null;
    low_52w: string | null;
    prev_close: string | null;
    change_val: string | null;
    change_pct: string | null;
    created_at: Generated<Timestamp | null>;
  };
  export type NseStock = {
    ticker: string;
    name: string;
    sector: string | null;
    data_rows: Generated<number>;
    first_date: Timestamp | null;
    last_date: Timestamp | null;
    is_active: Generated<boolean>;
    created_at: Generated<Timestamp | null>;
  };
  export type DB = {
    nse_features: NseFeature;
    nse_prices: NsePrice;
    nse_stocks: NseStock;
  };
}
