import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>로그인</Button>);
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByRole("button", { name: "클릭" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>비활성</Button>);
    fireEvent.click(screen.getByRole("button", { name: "비활성" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the variant class", () => {
    render(<Button variant="kakao">카카오로 시작하기</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-oauth-kakao");
  });

  it("defaults to full width", () => {
    render(<Button>기본</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("does not apply w-full when fullWidth is false", () => {
    render(<Button fullWidth={false}>좁게</Button>);
    expect(screen.getByRole("button")).not.toHaveClass("w-full");
  });
});
