import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#5B6FED",
          primaryHover: "#4A5DDB",
          panelFrom: "#5178EF",
          panelTo: "#BCD4FA",
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
