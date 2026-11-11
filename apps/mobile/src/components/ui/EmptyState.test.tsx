import { render, screen } from "@testing-library/react-native";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState title="아직 장소가 없어요" description="첫 장소를 추가해보세요" />);
    expect(screen.getByText("아직 장소가 없어요")).toBeTruthy();
    expect(screen.getByText("첫 장소를 추가해보세요")).toBeTruthy();
  });

  it("renders only the title in small mode", () => {
    render(<EmptyState title="결과 없음" description="설명" small />);
    expect(screen.getByText("결과 없음")).toBeTruthy();
    expect(screen.queryByText("설명")).toBeNull();
  });
});
