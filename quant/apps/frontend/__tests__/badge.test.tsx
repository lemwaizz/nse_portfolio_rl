import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@frontend/components/ui/badge";
import "@testing-library/jest-dom";

describe("Badge Component", () => {
  it("renders correctly as a span with default variant attributes", () => {
    render(<Badge>New Feature</Badge>);

    const badge = screen.getByText("New Feature");

    expect(badge).toBeInTheDocument();
    // Verify it defaults to a standard span element
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveAttribute("data-variant", "default");

    // Verifies one of the root base classes from cva is present
    expect(badge).toHaveClass("group/badge");
    // Verifies the default variant styling is merged
    expect(badge).toHaveClass("bg-primary");
  });

  it("applies variant classes correctly based on the variant prop", () => {
    const { rerender } = render(<Badge variant="destructive">Alert</Badge>);
    let badge = screen.getByText("Alert");
    expect(badge).toHaveAttribute("data-variant", "destructive");
    expect(badge).toHaveClass("bg-destructive/10");

    // Test the outline variant
    rerender(<Badge variant="outline">Info</Badge>);
    badge = screen.getByText("Info");
    expect(badge).toHaveAttribute("data-variant", "outline");
    expect(badge).toHaveClass("border-border");
  });

  it("merges custom classNames safely using the cn utility", () => {
    render(<Badge className="custom-class tracking-wide">Custom</Badge>);

    const badge = screen.getByText("Custom");

    expect(badge).toHaveClass("custom-class");
    expect(badge).toHaveClass("tracking-wide");
    expect(badge).toHaveClass("group/badge"); // still retains base styles
  });

  it("renders as a different component when asChild is true", () => {
    render(
      <Badge asChild variant="link">
        <a href="https://example.com">Click Link</a>
      </Badge>,
    );

    // Look for the inner text
    const badge = screen.getByText("Click Link");

    expect(badge).toBeInTheDocument();
    // Radix Slot merges the props onto the immediate child element
    expect(badge.tagName).toBe("A");
    expect(badge).toHaveAttribute("href", "https://example.com");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveAttribute("data-variant", "link");
    expect(badge).toHaveClass("text-primary");
  });

  it("forwards extra standard props appropriately", () => {
    render(<Badge aria-invalid="true">Error State</Badge>);

    const badge = screen.getByText("Error State");

    expect(badge).toHaveAttribute("aria-invalid", "true");
  });
});
