import type { ColumnType } from "kysely";
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const RiskProfileCategory = {
  conservative: "conservative",
  moderate: "moderate",
  aggressive: "aggressive",
} as const;
export type RiskProfileCategory =
  (typeof RiskProfileCategory)[keyof typeof RiskProfileCategory];
export const InvestmentHorizon = {
  short: "short",
  medium: "medium",
  long: "long",
} as const;
export type InvestmentHorizon =
  (typeof InvestmentHorizon)[keyof typeof InvestmentHorizon];
export const InvestmentGoal = {
  preserveCapital: "preserveCapital",
  generateIncome: "generateIncome",
  growWealth: "growWealth",
} as const;
export type InvestmentGoal =
  (typeof InvestmentGoal)[keyof typeof InvestmentGoal];
export const LossReaction = {
  sellImmediately: "sellImmediately",
  hold: "hold",
  buyMore: "buyMore",
} as const;
export type LossReaction = (typeof LossReaction)[keyof typeof LossReaction];
export type Account = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  password: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Company = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  name: string;
  ticker: string;
  logoUrl: string | null;
  createdById: string;
};
export type Feedback = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  userId: string;
  title: string;
  feedback: string;
};
export type Holding = {
  id: Generated<string>;
  userId: string;
  createdAt: Generated<Timestamp>;
  companyId: string;
  shares: number;
  averageSharePrice: number;
};
export type RiskProfile = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  userId: string;
  category: RiskProfileCategory;
  investementHorizon: InvestmentHorizon;
  investmentGoal: InvestmentGoal;
  lossReaction: LossReaction;
};
export type RLRecommendation = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  payload: unknown | null;
  userId: string;
  rationale: string | null;
};
export type Session = {
  id: string;
  expiresAt: Timestamp;
  token: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  impersonatedBy: string | null;
};
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: Generated<boolean>;
  image: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  role: string | null;
  banned: Generated<boolean | null>;
  banReason: string | null;
  banExpires: Timestamp | null;
};
export type Verification = {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type DB = {
  account: Account;
  company: Company;
  feedback: Feedback;
  holding: Holding;
  risk_profile: RiskProfile;
  rl_recommendation: RLRecommendation;
  session: Session;
  user: User;
  verification: Verification;
};
