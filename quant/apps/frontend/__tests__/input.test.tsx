// Input.test.tsx

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Input } from "@frontend/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("passes the type prop", () => {
    render(<Input type="password" />);

    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");
  });

  it("renders with a placeholder", () => {
    render(<Input placeholder="Enter your name" />);

    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("passes arbitrary HTML props", () => {
    render(
      <Input id="username" name="username" data-testid="username-input" />,
    );

    const input = screen.getByTestId("username-input");

    expect(input).toHaveAttribute("id", "username");
    expect(input).toHaveAttribute("name", "username");
  });

  it("applies the default classes", () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId("input");

    expect(input).toHaveClass("h-8");
    expect(input).toHaveClass("rounded-lg");
    expect(input).toHaveClass("border");
    expect(input).toHaveClass("w-full");
  });

  it("merges custom className with default classes", () => {
    render(
      <Input data-testid="input" className="custom-class another-class" />,
    );

    const input = screen.getByTestId("input");

    expect(input).toHaveClass("custom-class");
    expect(input).toHaveClass("another-class");
    expect(input).toHaveClass("h-8"); // default class still exists
  });

  it("sets the disabled attribute", () => {
    render(<Input disabled data-testid="input" />);

    expect(screen.getByTestId("input")).toBeDisabled();
  });

  it("sets the value correctly", () => {
    render(<Input value="John Doe" readOnly />);

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  it("forwards onChange handler", () => {
    const handleChange = jest.fn();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");

    input.focus();

    input.dispatchEvent(
      new Event("input", {
        bubbles: true,
      }),
    );
  });

  it("forwards data-slot attribute", () => {
    render(<Input data-testid="input" />);

    expect(screen.getByTestId("input")).toHaveAttribute("data-slot", "input");
  });
});
