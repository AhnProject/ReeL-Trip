import { Controller, Get } from "@nestjs/common";

@Controller("docs")
export class DocsController {
  @Get("spec")
  spec() {
    const baseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
    return {
      openapi: "3.1.0",
      info: {
        title: "ReeL-Trip API",
        version: "1.0.0",
        description: "AI 여행 추천 서비스 API",
      },
      servers: [{ url: baseUrl }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      paths: {
        "/api/auth/signup": {
          post: {
            tags: ["auth"],
            summary: "회원가입 및 JWT 발급",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["username", "password", "email"],
                    properties: {
                      username: { type: "string", minLength: 3, maxLength: 50 },
                      password: { type: "string", minLength: 8, maxLength: 100 },
                      email: { type: "string", format: "email" },
                    },
                  },
                },
              },
            },
          },
        },
        "/api/auth/login": {
          post: {
            tags: ["auth"],
            summary: "로그인 및 JWT 발급",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["username", "password"],
                    properties: {
                      username: { type: "string" },
                      password: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        "/api/documents/health": {
          get: { tags: ["documents"], summary: "헬스체크" },
        },
        "/api/documents": {
          get: { tags: ["documents"], summary: "문서 목록 조회", security: [{ bearerAuth: [] }] },
          post: { tags: ["documents"], summary: "문서 생성", security: [{ bearerAuth: [] }] },
        },
        "/api/documents/{id}": {
          get: { tags: ["documents"], summary: "문서 조회", security: [{ bearerAuth: [] }] },
          put: { tags: ["documents"], summary: "문서 수정", security: [{ bearerAuth: [] }] },
          delete: { tags: ["documents"], summary: "문서 삭제", security: [{ bearerAuth: [] }] },
        },
        "/api/documents/search": {
          post: { tags: ["documents"], summary: "벡터 유사도 검색", security: [{ bearerAuth: [] }] },
        },
        "/api/recommend": {
          get: { tags: ["recommend"], summary: "헬스체크" },
          post: { tags: ["recommend"], summary: "AI 여행 추천" },
        },
      },
    };
  }
}
