import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Separator } from "@frontend/components/ui/separator";
import "@testing-library/jest-dom";

describe("Separator Component", () => {
  it("renders correctly with default horizontal and decorative attributes", () => {
    // Note: When decorative={true}, Radix gives it role="none" or role="presentation"
    // so we search by data-testid or custom selector since it's hidden from structural landmarks
    render(<Separator data-testid="separator-default" />);

    const separator = screen.getByTestId("separator-default");

    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-slot", "separator");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");

    // Check that default style utilities are assigned
    expect(separator).toHaveClass("bg-border");
    expect(separator).toHaveClass("shrink-0");
  });

  it("applies proper attributes when orientation is vertical", () => {
    render(
      <Separator orientation="vertical" data-testid="separator-vertical" />,
    );

    const separator = screen.getByTestId("separator-vertical");

    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });

  it("exposes the correct accessibility role when decorative is false", () => {
    render(<Separator decorative={false} aria-label="Content separator" />);

    // When decorative is false, it behaves as an explicit semantic landmark
    const separator = screen.getByRole("separator");

    expect(separator).toBeInTheDocument();
  });

  it("merges custom classNames safely using the cn utility", () => {
    render(
      <Separator
        className="my-custom-margin bg-red-500"
        data-testid="separator-styles"
      />,
    );

    const separator = screen.getByTestId("separator-styles");

    expect(separator).toHaveClass("my-custom-margin");
    expect(separator).toHaveClass("bg-red-500");
    expect(separator).toHaveClass("shrink-0"); // base class preserved
  });

  it("forwards extra HTML element properties down to the root DOM element", () => {
    render(
      <Separator
        id="structural-divider"
        title="Divider line"
        data-testid="separator-props"
      />,
    );

    const separator = screen.getByTestId("separator-props");

    expect(separator).toHaveAttribute("id", "structural-divider");
    expect(separator).toHaveAttribute("title", "Divider line");
  });
});
