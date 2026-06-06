import { C } from "./colors";

/** 스페이싱 스케일 */
export const sp = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
} as const;

/** 보더 반경 */
export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
} as const;

/** 그림자 */
export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
} as const;

/** 카드 (흰 배경 + 테두리) */
export const card = {
  backgroundColor: C.white,
  borderRadius:    radius.lg,
  borderWidth:     1,
  borderColor:     C.border,
} as const;

/** 모달 헤더 바 */
export const modalHeader = {
  flexDirection:          "row"            as const,
  alignItems:             "center"         as const,
  justifyContent:         "space-between"  as const,
  paddingHorizontal:      sp.xl,
  paddingVertical:        sp.lg,
  backgroundColor:        C.white,
  borderBottomWidth:      1,
  borderBottomColor:      C.border,
} as const;

/** 스크린 상단 헤더 바 */
export const screenHeader = {
  flexDirection:          "row"            as const,
  alignItems:             "center"         as const,
  justifyContent:         "space-between"  as const,
  paddingHorizontal:      sp.xl,
  paddingVertical:        sp.md,
  backgroundColor:        C.white,
  borderBottomWidth:      1,
  borderBottomColor:      C.border,
} as const;

/** 텍스트 인풋 */
export const input = {
  borderWidth:       1,
  borderColor:       C.borderLight,
  borderRadius:      radius.md,
  paddingHorizontal: 14,
  paddingVertical:   sp.md,
  fontSize:          14,
  color:             C.t1,
  backgroundColor:   C.white,
} as const;

/** flex row + center */
export const row = {
  flexDirection: "row" as const,
  alignItems:    "center" as const,
} as const;

/** 섹션 헤더 (타이틀 + 우측 액션) */
export const sectionHeader = {
  ...row,
  justifyContent: "space-between" as const,
  marginBottom:   sp.md,
} as const;

/** RT 배지 */
export const rtBadge = {
  width:           36,
  height:          36,
  borderRadius:    radius.sm + 2,
  backgroundColor: C.primary,
  alignItems:      "center"  as const,
  justifyContent:  "center"  as const,
} as const;
