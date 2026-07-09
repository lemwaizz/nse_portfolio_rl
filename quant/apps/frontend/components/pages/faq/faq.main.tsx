"use client";

import Footer from "../../shared/footer";
import Header from "../../shared/header";
import { Badge } from "../../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@frontend/components/ui/accordion";

const items = [
  {
    sectionTitle: "🚀 Getting Started",
    defaultValue: ["billing"],
    items: [
      {
        value: "billing",
        trigger: "How do i create an account with NSE-Quant?",
        content:
          "To begin your journey, simply click the 'Get Started' button in the navigation bar. You'll need to provide basic information and complete our investor profiling survey, which helps our AI understand your risk tolerance and financial goals specifically for the Nairobi Securities Exchange market landscape.",
      },
      {
        value: "security",
        trigger: "What is the minimum investment required?",
        content:
          "We aim to make sophisticated investing accessible to all Kenyans. Our platform supports entry-level portfolios from any initial amount, allowing you to benefit from high-level algorithmic management regardless of your initial capital size.",
      },
    ],
  },
  {
    sectionTitle: "🛡️ Security",
    defaultValue: [],
    items: [
      {
        value: "billing",
        trigger: "How does the AI optimize for the Kenyan market specifically?",
        content:
          "Unlike generic robo-advisors, our proprietary machine learning model is trained on decades of Nairobi Securities Exchange data, macroeconomic indicators specific to the East African region, and real-time liquidity trends. It identifies patterns that human analysts might miss, providing a localized edge.",
      },
      {
        value: "security",
        trigger: "Is my data secure?",
        content:
          "Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits. All data is encrypted at rest and in transit using industry-standard protocols.",
      },
    ],
  },
  {
    sectionTitle: "💹 Investment Strategy",
    defaultValue: [],
    items: [
      {
        value: "billing",
        trigger: "What asset classes are supported on the platform?",
        content:
          " We primarily focus on NSE-listed equities and government bonds. Our AI analyzes blue-chip stocks, growth stocks, and high-yield fixed-income instruments to build a balanced portfolio that captures the best opportunities in Kenya's financial markets.",
      },
    ],
  },
];

const FAQMainComponent = () => {
  return (
    <div>
      <Header />
      <div className="mt-[100px]">
        <div className="relative max-w-7xl mx-auto px-4 my-8 md:my-16 overflow-hidden rounded-3xl p-4">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-bg.png')" }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          <div className="relative flex flex-col gap-2">
            <Badge>Risk Suport Center</Badge>
            <p className="font-bold text-3xl">
              How can we help you navigate the <br />
              <span className="text-primary">NSE?</span>
            </p>
            <p className="max-w-lg text-muted-foreground">
              Find answers to common questions about out RL-driven investment
              platform specifically trailored for the Nairobi Stock Exchange
            </p>
          </div>
        </div>
        <div className="flex flex-col max-w-7xl mx-auto my-10 gap-8">
          {items.map((item, index) => {
            return <FAQSection key={index} section={item} />;
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const FAQSection = ({ section }: { section: (typeof items)[0] }) => {
  return (
    <div className="max-w-lg mx-auto w-full">
      <div className="font-bold text-xl mb-3">{section.sectionTitle}</div>
      <div>
        <Accordion
          defaultValue={section.defaultValue}
          className="max-w-lg rounded-lg border"
          type="multiple"
        >
          {section.items.map((item) => (
            <AccordionItem
              key={item.value}
              value={item.value}
              className="border-b px-4 last:border-b-0"
            >
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQMainComponent;
