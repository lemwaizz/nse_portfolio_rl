import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@frontend/components/ui/empty";
import "@testing-library/jest-dom";

describe("Empty State Components Suite", () => {
  it("renders a full structured compositional layout with expected data attributes", () => {
    render(
      <Empty data-testid="empty-root">
        <EmptyHeader>
          <EmptyMedia data-testid="empty-media">
            <span>🔍</span>
          </EmptyMedia>
          <EmptyTitle>No Projects Found</EmptyTitle>
          <EmptyDescription>Try refining your search filters.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button type="button">Clear Filters</button>
        </EmptyContent>
      </Empty>,
    );

    // 1. Verify Root Container
    const root = screen.getByTestId("empty-root");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("data-slot", "empty");
    expect(root).toHaveClass("border-dashed");

    // 2. Verify Media container and fallback content
    const media = screen.getByTestId("empty-media");
    expect(media).toHaveAttribute("data-slot", "empty-icon");
    expect(media).toHaveAttribute("data-variant", "default");
    expect(screen.getByText("🔍")).toBeInTheDocument();

    // 3. Verify Title and Description texts
    const title = screen.getByText("No Projects Found");
    expect(title).toHaveAttribute("data-slot", "empty-title");
    expect(title).toHaveClass("font-medium");

    const description = screen.getByText("Try refining your search filters.");
    expect(description).toHaveAttribute("data-slot", "empty-description");

    // 4. Verify Content and child elements
    const actionBtn = screen.getByRole("button", { name: "Clear Filters" });
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn.closest("div")).toHaveAttribute(
      "data-slot",
      "empty-content",
    );
  });

  it("applies cva variant classes correctly to EmptyMedia", () => {
    const { rerender } = render(
      <EmptyMedia data-testid="variant-test" variant="icon" />,
    );
    let media = screen.getByTestId("variant-test");

    expect(media).toHaveAttribute("data-variant", "icon");
    expect(media).toHaveClass("bg-muted");
    expect(media).toHaveClass("size-8");

    // Re-render with default configuration
    rerender(<EmptyMedia data-testid="variant-test" variant="default" />);
    media = screen.getByTestId("variant-test");

    expect(media).toHaveAttribute("data-variant", "default");
    expect(media).toHaveClass("bg-transparent");
    expect(media).not.toHaveClass("size-8");
  });

  it("safely merges user custom classNames via the cn utility across components", () => {
    render(
      <Empty className="custom-root-style" data-testid="root">
        <EmptyTitle className="custom-title-style">Title</EmptyTitle>
      </Empty>,
    );

    const root = screen.getByTestId("root");
    const title = screen.getByText("Title");

    expect(root).toHaveClass("custom-root-style");
    expect(root).toHaveClass("flex-col"); // retains structure

    expect(title).toHaveClass("custom-title-style");
    expect(title).toHaveClass("font-heading"); // retains structure
  });

  it("correctly handles additional HTML properties forwarded down to the DOM", () => {
    render(
      <EmptyDescription id="desc-id" title="hint description">
        Forwarding test
      </EmptyDescription>,
    );

    const description = screen.getByText("Forwarding test");

    expect(description).toHaveAttribute("id", "desc-id");
    expect(description).toHaveAttribute("title", "hint description");
  });
});
