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
