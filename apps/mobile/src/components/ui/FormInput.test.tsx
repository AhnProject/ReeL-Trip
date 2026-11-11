import { render, screen, fireEvent } from "@testing-library/react-native";
import { FormInput } from "./FormInput";

describe("FormInput", () => {
  it("renders the label", () => {
    render(<FormInput label="이메일" />);
    expect(screen.getByText("이메일")).toBeTruthy();
  });

  it("calls onChangeText when typing", () => {
    const onChangeText = jest.fn();
    render(<FormInput label="이메일" onChangeText={onChangeText} testID="email-input" />);
    fireEvent.changeText(screen.getByTestId("email-input"), "alice@example.com");
    expect(onChangeText).toHaveBeenCalledWith("alice@example.com");
  });
});
