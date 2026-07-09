import { authClient } from "@/packages/clients/src";
import { useSusiDialog } from "../dialogs";
import { Button } from "@frontend/components/ui/button";
import { Spinner } from "@frontend/components/ui/spinner";
import Link from "next/link";
import { ThemeModeToggle } from "./theme_mode_toggle";
import { BrainCircuit } from "lucide-react";

const Header = () => {
  const { SusiDialog, setSusiDialog } = useSusiDialog();
  const loginHandler = () => {
    setSusiDialog(true);
  };
  const { data, error, isPending } = authClient.useSession();

  const navElements = [
    { title: "Home", href: "/" },
    // { title: "How It Works", href: "#" },
    { title: "FAQ", href: "/faq" },
    // { title: "About Us", href: "#" },
  ];

  return (
    <header className="max-w-7xl mx-auto ">
      <div className="z-12 bg-background px-3 border-b-2 flex items-center justify-around fixed top-0 left-0 right-0">
        <SusiDialog />
        <div className="font-bold text-2xl text-primary">
          <Link href={"/"} className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <BrainCircuit className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">NSE Quant</span>
              {/* <span className="">v1.0.0</span> */}
            </div>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          {navElements.map((el, index) => {
            return (
              <SingleNavElement key={index} href={el.href} title={el.title} />
            );
          })}
        </nav>
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
                <ThemeModeToggle />
              </div>
            )}
            {(error || !data) && (
              <div className="flex gap-4 my-4">
                <Button onClick={loginHandler}>Get Started</Button>
                <Button variant={"outline"} onClick={loginHandler}>
                  Login
                </Button>
                <ThemeModeToggle />
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

const SingleNavElement = ({ href, title }: { href: string; title: string }) => {
  return (
    <Link
      href={href}
      className="font-light hover:text-primary hover:underline hover:underline-offset-4 transition-all duration-200"
    >
      {title}
    </Link>
  );
};

export default Header;
