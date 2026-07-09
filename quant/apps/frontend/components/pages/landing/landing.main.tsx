"use client";
import { Badge } from "@frontend/components/ui/badge";
import { Button } from "@frontend/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useSusiDialog } from "../../dialogs";
import { authClient } from "@/packages/clients/src";
import { Spinner } from "@frontend/components/ui/spinner";
import Header from "../../shared/header";
import Footer from "../../shared/footer";

const LandingMainComponent = () => {
  const { SusiDialog, setSusiDialog } = useSusiDialog();
  const loginHandler = () => {
    setSusiDialog(true);
  };
  const { data, error, isPending } = authClient.useSession();

  return (
    <>
      <Header />
      <SusiDialog />
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col items-center">
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
            built specifically for the Kenyan market. Optimize portfolios,
            profile risks, and secure your financial future with algorithmic
            certainty.
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
      </div>
      <Footer />
    </>
    // <>
    //   <Header />
    //   <SusiDialog />
    //   <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
    //     {/* Background image */}
    //     <div
    //       className="absolute inset-0 bg-cover bg-center"
    //       style={{ backgroundImage: "url('/images/hero-bg.png')" }}
    //     />

    //     {/* Overlay */}
    //     <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

    //     {/* Content — needs relative + z-index to sit above the layers above */}
    //     <div className="relative z-10 flex flex-col items-center">
    //       <Badge className="uppercase">
    //         <Sparkles />
    //         Machine Learning Optimizer
    //       </Badge>
    //       <div className="text-3xl text-center font-bold my-3">
    //         <span className="text-primary">AI-Powered Precision</span> for the
    //         NSE.
    //       </div>
    //       <div className="text-muted-foreground max-w-lg text-center">
    //         Master the Nairobi Securities Exchange with the first robo-advisor
    //         built specifically for the Kenyan market. Optimize portfolios,
    //         profile risks, and secure your financial future with algorithmic
    //         certainty.
    //       </div>
    //       {isPending ? (
    //         <div className="my-4">
    //           <Spinner />
    //         </div>
    //       ) : (
    //         <>
    //           {data && (
    //             <div className="flex gap-4 my-4">
    //               <Button asChild>
    //                 <Link href={"/dashboard"}>Get Started</Link>
    //               </Button>
    //               <Button variant={"outline"} onClick={loginHandler}>
    //                 Login
    //               </Button>
    //             </div>
    //           )}
    //           {(error || !data) && (
    //             <div className="flex gap-4 my-4">
    //               <Button onClick={loginHandler}>Get Started</Button>
    //               <Button variant={"outline"} onClick={loginHandler}>
    //                 Login
    //               </Button>
    //             </div>
    //           )}
    //         </>
    //       )}
    //     </div>
    //   </div>
    //   <Footer />
    // </>
  );
};

export default LandingMainComponent;
