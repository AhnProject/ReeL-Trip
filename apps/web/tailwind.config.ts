import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#4A6CF7",
          primaryHover: "#3A5CE0",
          panelFrom: "#4A6CF7",
          panelTo: "#7B68EE",
        },
        oauth: {
          naver: "#03C75A",
          kakao: "#FEE500",
        },
        accent: {
          danger: "#E84E5C",
        },
        tsstatus: {
          greenBg:    "#DCFCE7",
          greenText:  "#16A34A",
          redBg:      "#FEE2E2",
          redText:    "#DC2626",
          orangeBg:   "#FEF3C7",
          orangeText: "#D97706",
          purpleBg:   "#EDE9FE",
          purpleText: "#7C3AED",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
