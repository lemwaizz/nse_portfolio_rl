import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@frontend/components/ui/breadcrumb";
import "@testing-library/jest-dom";

describe("Breadcrumb Components Suite", () => {
  it("renders a full breadcrumb structure with correct basic attributes", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    // 1. Verify top level Nav wrapper
    const nav = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("data-slot", "breadcrumb");

    // 2. Verify List wrapper
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-slot", "breadcrumb-list");

    // 3. Verify standard links & pages
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveAttribute("data-slot", "breadcrumb-link");

    const page = screen.getByText("Current Page");
    expect(page).toHaveAttribute("data-slot", "breadcrumb-page");
  });

  it("respects strict accessibility standards for current pages and screen readers", () => {
    render(<BreadcrumbPage>Pricing</BreadcrumbPage>);

    const page = screen.getByText("Pricing");

    // Crucial for telling screen readers this is the active node
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveAttribute("aria-disabled", "true");
  });

  it("hides separators from assistive technologies", () => {
    render(
      <BreadcrumbSeparator data-testid="separator-node">/</BreadcrumbSeparator>,
    );

    const separator = screen.getByTestId("separator-node");

    // Separators must have presentation roles and be hidden from screen readers
    expect(separator).toHaveAttribute("role", "presentation");
    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).toHaveTextContent("/");
  });

  it("renders custom icons inside the separator if provided, otherwise falls back to default icon", () => {
    const { rerender } = render(
      <BreadcrumbSeparator data-testid="default-sep" />,
    );
    const defaultSep = screen.getByTestId("default-sep");
    // Checks that the SVG icon placeholder structure was rendered
    expect(defaultSep.querySelector("svg")).toBeInTheDocument();

    // Verify passing custom child works
    rerender(
      <BreadcrumbSeparator data-testid="custom-sep">
        <span>→</span>
      </BreadcrumbSeparator>,
    );
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("renders ellipsis for hidden tracks with a screen-reader fallback", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId("ellipsis");

    expect(ellipsis).toHaveAttribute("role", "presentation");
    expect(ellipsis).toHaveAttribute("aria-hidden", "true");

    // Screen readers should hear "More" instead of skipping it entirely or stumbling on structural design
    const srText = screen.getByText("More");
    expect(srText).toHaveClass("sr-only");
  });

  it("supports polymorphic rendering via the asChild prop on BreadcrumbLink", () => {
    render(
      <BreadcrumbLink asChild>
        <button type="button">Dashboard Button</button>
      </BreadcrumbLink>,
    );

    const composedButton = screen.getByRole("button", {
      name: "Dashboard Button",
    });

    expect(composedButton).toBeInTheDocument();
    expect(composedButton.tagName).toBe("BUTTON");
    expect(composedButton).toHaveAttribute("data-slot", "breadcrumb-link");
    expect(composedButton).toHaveClass("transition-colors");
  });
});
