import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@frontend/components/ui/accordion";
import "@testing-library/jest-dom";

describe("Accordion Component", () => {
  const renderAccordion = (props = {}) => {
    return render(
      <Accordion type="single" collapsible {...props}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with beautiful default styles.
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
  };

  it("renders all accordion triggers correctly", () => {
    renderAccordion();

    expect(
      screen.getByRole("button", { name: /is it accessible\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /is it styled\?/i }),
    ).toBeInTheDocument();
  });

  it("initially hides content and opens it when a trigger is clicked", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const trigger = screen.getByRole("button", { name: /is it accessible\?/i });

    // Radix applies aria-expanded="false" when closed
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Click to open
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/yes\. it adheres to the wai-aria design pattern\./i),
    ).toBeInTheDocument();
  });

  it("collapses an open section when clicked again", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const trigger = screen.getByRole("button", { name: /is it accessible\?/i });

    // Open it
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Close it
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports default open items via defaultValue prop", () => {
    renderAccordion({ defaultValue: "item-2" });

    const trigger1 = screen.getByRole("button", {
      name: /is it accessible\?/i,
    });
    const trigger2 = screen.getByRole("button", { name: /is it styled\?/i });

    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(trigger2).toHaveAttribute("aria-expanded", "true");
  });
});
