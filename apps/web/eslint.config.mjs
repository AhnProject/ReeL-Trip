import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    rules: {
      // _ 접두사 변수/인자는 "의도적 미사용"으로 간주
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // 영상 썸네일 등 동적 외부 URL 이미지가 핵심 기능이라 <img>를 구조적으로 사용.
      // next/image는 임의 외부 도메인에 부적합하므로 규칙을 끈다.
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
