import type { RiskProfileCategory } from "@/apps/coordinator/src/models/enums/enums";

export const riskProfileMapping: Record<
  RiskProfileCategory,
  { title: string; description: string }
> = {
  aggressive: {
    title: "Aggressive",
    description:
      "Seeking high capital growth with greater exposure to market volatility.",
  },
  conservative: {
    title: "Conservative",
    description:
      "Focused on preserving capital with steady, lower-risk returns.",
  },
  moderate: {
    title: "Moderate",
    description:
      "Balancing growth and stability with a moderate tolerance for risk.",
  },
};

export const STOCK_META = {
  SCOM: { category: "Telecommunications" },
  EQTY: { category: "Banking" },
  KCB: { category: "Banking" },
  ABSA: { category: "Banking" },
  COOP: { category: "Banking" },
  EABL: { category: "Manufacturing" },
  BAMB: { category: "Manufacturing" },
  SCBK: { category: "Banking" },
  NCBA: { category: "Banking" },
  BAT: { category: "Manufacturing" },
  JUB: { category: "Insurance" },
  KPLC: { category: "Energy & Utilities" },
  BRIT: { category: "Insurance" },
  CIC: { category: "Insurance" },
  KNRE: { category: "Insurance" },
  SLAM: { category: "Insurance" },
  DTK: { category: "Banking" },
  HFCK: { category: "Banking" },
  NBK: { category: "Banking" },
  NBV: { category: "Banking" },
  IMH: { category: "Banking" },
  KEGN: { category: "Energy & Utilities" },
  TOTL: { category: "Construction" },
  ARM: { category: "Manufacturing" },
  CABL: { category: "Manufacturing" },
  CARB: { category: "Manufacturing" },
  UNGA: { category: "Manufacturing" },
  SCAN: { category: "Manufacturing" },
  NMG: { category: "Media" },
  NSE: { category: "Financial Services" },
  CTUM: { category: "Investment" },
  GLD: { category: "Investment" },
  SBIC: { category: "Investment" },
  KUKZ: { category: "Agriculture" },
  LIMT: { category: "Agriculture" },
  KAPC: { category: "Agriculture" },
  SASN: { category: "Agriculture" },
  EGAD: { category: "Agriculture" },
  HAFR: { category: "Agriculture" },
  FAHR: { category: "Agriculture" },
  WTK: { category: "Agriculture" },
  UCHM: { category: "Manufacturing" },
  UMME: { category: "Manufacturing" },
  EVRD: { category: "Manufacturing" },
  CRWN: { category: "Manufacturing" },
  FTGH: { category: "Manufacturing" },
  TCL: { category: "Manufacturing" },
  CGEN: { category: "Manufacturing" },
  OCH: { category: "Commercial" },
  PORT: { category: "Commercial" },
  MSC: { category: "Commercial" },
  BKG: { category: "Commercial" },
  LAPR: { category: "Commercial" },
  LBTY: { category: "Commercial" },
  LKL: { category: "Commercial" },
  XPRS: { category: "Commercial" },
  ORCH: { category: "Commercial" },
  HBE: { category: "Real Estate" },
  KURV: { category: "Real Estate" },
  KQ: { category: "Transport" },
  SMER: { category: "Transport" },
  DCON: { category: "Construction" },
  BOC: { category: "Manufacturing" },
  TPSE: { category: "Energy & Utilities" },
  "KPLC-P4": { category: "Energy & Utilities" },
  "KPLC-P7": { category: "Energy & Utilities" },
} as const;

export type StockTicker = keyof typeof STOCK_META;
export type StockCategory = (typeof STOCK_META)[StockTicker]["category"];
