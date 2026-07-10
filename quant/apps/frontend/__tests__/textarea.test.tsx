import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@frontend/components/ui/textarea"; // Adjust the import path as needed
import "@testing-library/jest-dom";

describe("Textarea Component", () => {
  it("renders correctly with default attributes", () => {
    render(<Textarea placeholder="Enter text here..." />);

    const textarea = screen.getByPlaceholderText("Enter text here...");

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("data-slot", "textarea");
    // Verifies one of the core base classes is present
    expect(textarea).toHaveClass("field-sizing-content");
  });

  it("merges custom classNames correctly without overriding base styles", () => {
    render(
      <Textarea placeholder="Test" className="custom-class explicit-margin" />,
    );

    const textarea = screen.getByPlaceholderText("Test");

    // Verifies your `cn` utility successfully appends the custom classes
    expect(textarea).toHaveClass("custom-class");
    expect(textarea).toHaveClass("explicit-margin");
    expect(textarea).toHaveClass("field-sizing-content");
  });

  it("allows user typing and handles value updates", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type here" />);

    const textarea = screen.getByPlaceholderText("Type here");

    await user.type(textarea, "Hello, World!");
    expect(textarea).toHaveValue("Hello, World!");
  });

  it("respects the disabled state", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <Textarea
        placeholder="Disabled textarea"
        disabled
        onChange={handleChange}
      />,
    );

    const textarea = screen.getByPlaceholderText("Disabled textarea");

    // expect(textarea).toBeDisabled();

    // Attempt to type and verify it doesn't trigger state changes
    await user.type(textarea, "Trying to type...");
    expect(textarea).toHaveValue("");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("applies correct aria attributes when invalid", () => {
    render(<Textarea placeholder="Invalid input" aria-invalid="true" />);

    const textarea = screen.getByPlaceholderText("Invalid input");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("correctly forwards a ref to the underlying textarea element", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea placeholder="Ref test" ref={ref} />);

    const textarea = screen.getByPlaceholderText("Ref test");

    expect(ref.current).toBe(textarea);
  });
});
