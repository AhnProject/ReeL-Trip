import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "./LoadingScreen";

describe("LoadingScreen", () => {
  it("renders the loading message", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });
});
