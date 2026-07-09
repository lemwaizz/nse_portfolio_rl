import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-accent">
      <div className="max-w-5xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 py-5 gap-4 lg:gap-5">
          <div>
            <div className="text-primary font-bold text-2xl mb-2">
              NSE Quant
            </div>
            <p className="text-muted-foreground">
              Empowering the Kenyan investor through cutting-edge intellligence
              and market proven algorithms.
            </p>
          </div>
          <div className="px-3">
            <div className="text-primary mb-2">Platform</div>
            <ul>
              <LinkItem label="About" href="#" />
              <LinkItem label="Features" href="#" />
              <LinkItem label="Security" href="#" />
              <LinkItem label="FAQ" href="/faq" />
            </ul>
          </div>
          <div className="px-3">
            <div className="text-primary mb-2">Legal</div>
            <ul>
              <LinkItem label="Terms of Service" href="#" />
              <LinkItem label="Privacy Policy" href="#" />
              <LinkItem label="Investor Relations" href="#" />
              <LinkItem label="Risk Disclosure" href="#" />
            </ul>
          </div>
          <div className="px-3">
            <div className="text-primary mb-2">Newsletter</div>
            <p className="mb-2">Get weekly market insights.</p>
            <div className="flex gap-2">
              <Input placeholder="Email Address" />
              <Button
                variant="default"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 hover:text-foreground text-muted-foreground`}
              >
                <div>
                  <Send className="h-5 w-5 text-primary-foreground" />
                  <span className="sr-only">Send</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t flex items-center justify-center py-3 text-sm text-muted-foreground">
          &copy;2026 NSE-Advisor. Algorithm for the Kenyan market
        </div>
      </div>
    </div>
  );
};

const LinkItem = ({ label, href }: { label: string; href: string }) => {
  return (
    <li className="text-sm hover:text-muted-foreground">
      <Link href={href}>{label}</Link>
    </li>
  );
};

export default Footer;
