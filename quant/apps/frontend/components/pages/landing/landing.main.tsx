"use client";
import { Badge } from "@frontend/components/ui/badge";
import { Button } from "@frontend/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useSusiDialog } from "../../dialogs";
import { authClient } from "@/packages/clients/src";
import { Spinner } from "@frontend/components/ui/spinner";

const LandingMainComponent = () => {
  const { SusiDialog, setSusiDialog } = useSusiDialog();
  const loginHandler = () => {
    setSusiDialog(true);
  };
  const { data, error, isPending } = authClient.useSession();

  return (
    <>
      <SusiDialog />
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <Badge className="uppercase">
          <Sparkles />
          Machine Learning Optimizer
        </Badge>
        <div className="text-3xl text-center font-bold my-3">
          <span className="text-primary">AI-Powered Precision</span> for the
          NSE.
        </div>
        <div className="text-muted-foreground max-w-lg text-center">
          Master the Nairobi Securities Exchange with the first robo-advisor
          built specifically for the Kenyan market. Optimize portfolios, profile
          risks, and secure your financial future with algorithmic certainty.
        </div>
        {isPending ? (
          <div className="my-4">
            <Spinner />
          </div>
        ) : (
          <>
            {data && (
              <div className="flex gap-4 my-4">
                <Button asChild>
                  <Link href={"/dashboard"}>Get Started</Link>
                </Button>
                <Button variant={"outline"} onClick={loginHandler}>
                  Login
                </Button>
              </div>
            )}
            {(error || !data) && (
              <div className="flex gap-4 my-4">
                <Button onClick={loginHandler}>Get Started</Button>
                <Button variant={"outline"} onClick={loginHandler}>
                  Login
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default LandingMainComponent;
