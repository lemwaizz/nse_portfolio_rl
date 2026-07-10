import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "@frontend/components/ui/switch";
import "@testing-library/jest-dom";

describe("Switch Component", () => {
  it("renders correctly with default unchecked states", () => {
    render(<Switch aria-label="Toggle setting" />);

    // Radix UI Switch maps to the role "switch"
    const switchEl = screen.getByRole("switch", { name: "Toggle setting" });

    expect(switchEl).toBeInTheDocument();
    expect(switchEl).not.toBeChecked(); // data-state="unchecked" internally maps to this matcher
    expect(switchEl).toHaveAttribute("data-slot", "switch");
    expect(switchEl).toHaveAttribute("data-size", "default");
  });

  it("applies custom size attributes correctly", () => {
    render(<Switch aria-label="Small switch" size="sm" />);

    const switchEl = screen.getByRole("switch", { name: "Small switch" });

    expect(switchEl).toHaveAttribute("data-size", "sm");
  });

  it("toggles state when clicked by the user", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(<Switch aria-label="Toggle me" onCheckedChange={onCheckedChange} />);
    const switchEl = screen.getByRole("switch", { name: "Toggle me" });

    // Initial state
    expect(switchEl).not.toBeChecked();

    // First click -> turn on
    await user.click(switchEl);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(switchEl).toBeChecked();

    // Second click -> turn off
    await user.click(switchEl);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(switchEl).not.toBeChecked();
  });

  it("respects the disabled attribute and blocks interaction", async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <Switch
        aria-label="Disabled switch"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const switchEl = screen.getByRole("switch", { name: "Disabled switch" });

    expect(switchEl).toBeDisabled();

    // Attempt interaction
    await user.click(switchEl);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(switchEl).not.toBeChecked();
  });

  it("merges custom classNames safely without wiping utility configurations", () => {
    render(<Switch aria-label="Styled switch" className="custom-test-class" />);
    const switchEl = screen.getByRole("switch", { name: "Styled switch" });

    expect(switchEl).toHaveClass("custom-test-class");
    expect(switchEl).toHaveClass("peer"); // preserves base classes
  });

  it("supports keyboard space/enter activation native to standard controls", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Keyboard switch" />);
    const switchEl = screen.getByRole("switch", { name: "Keyboard switch" });

    switchEl.focus();
    expect(switchEl).toHaveFocus();

    // Press Space bar to turn on
    await user.keyboard("[Space]");
    expect(switchEl).toBeChecked();
  });
});
