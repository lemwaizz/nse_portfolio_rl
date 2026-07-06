import Elysia from "elysia";
import { holdingsController } from "@coordinator/api/routes/holdings/holdings.controller";
import { companiesController } from "@coordinator/api/routes/companies/companies.controller";
import { riskProfilesController } from "@coordinator/api/routes/risk_profiles/risk_profile.controller";
import { recommendationsController } from "@coordinator/api/routes/recommendations/recommendations.controller";
import { feedbackController } from "@coordinator/api/routes/feedback/feedback.controller";

export const apiModule = new Elysia()
  .use(holdingsController)
  .use(companiesController)
  .use(riskProfilesController)
  .use(recommendationsController)
  .use(feedbackController);
