import { OnBoardingRiskProfile } from "@/apps/frontend/components/pages/onboarding/onboarding_risk_profile";
import { AddRiskProfileFlowMainComponent } from "@frontend/components/pages/add_risk_profile_flow/add_risk_profile_flow.main";

const UpdateRiskProfilePage = () => {
  return (
    <div className="flex items-center justify-center my-12">
      <OnBoardingRiskProfile page="riskProfileUpdate" />
    </div>
  );
};

export default UpdateRiskProfilePage;
