import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";

const apiResponse = (dataSchema: object) => ({
  "application/json": {
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: dataSchema,
        message: { type: "string", example: "success" },
        errorCode: { type: "string", nullable: true, example: null },
        timestamp: { type: "number", example: 1715000000000 },
      },
    },
  },
});

const errorResponse = (code: string, message: string) => ({
  "application/json": {
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        data: { type: "null", example: null },
        message: { type: "string", example: message },
        errorCode: { type: "string", example: code },
        timestamp: { type: "number", example: 1715000000000 },
      },
    },
  },
});

const documentSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "1" },
    title: { type: "string", example: "제주도 여행 코스" },
    content: { type: "string", example: "제주도 3박 4일 여행 추천 코스입니다." },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time", nullable: true },
  },
};

@Controller("docs")
export class DocsController {
  @Get("spec")
  spec(@Res() res: Response) {
    const baseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
    const spec = {
      openapi: "3.1.0",
      info: {
        title: "ReeL-Trip API",
        version: "1.0.0",
        description: [
          "## ReeL-Trip REST API",
          "",
          "AI 기반 여행 추천 서비스의 백엔드 API입니다.",
          "",
          "### 인증",
          "보호된 엔드포인트는 `Authorization: Bearer <token>` 헤더가 필요합니다.",
          "로그인 또는 회원가입 후 발급된 `accessToken`을 사용하세요.",
          "",
          "### 응답 형식",
          "모든 응답은 아래 공통 envelope로 반환됩니다.",
          "```json",
          '{  "success": true,  "data": { ... },  "message": "success",  "errorCode": null,  "timestamp": 1715000000000 }',
          "```",
        ].join("\n"),
      },
      servers: [{ url: baseUrl, description: "API 서버" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Document: documentSchema,
        },
      },
      tags: [
        { name: "auth", description: "회원가입 / 로그인" },
        { name: "documents", description: "여행 문서 CRUD 및 벡터 검색" },
        { name: "recommend", description: "AI 여행 추천" },
      ],
      paths: {
        "/api/auth/signup": {
          post: {
            tags: ["auth"],
            summary: "회원가입",
            description: "새 계정을 생성하고 JWT 토큰을 발급합니다.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["username", "password", "email"],
                    properties: {
                      username: { type: "string", minLength: 3, maxLength: 50, example: "traveler01" },
                      password: { type: "string", minLength: 8, maxLength: 100, example: "password123" },
                      email: { type: "string", format: "email", example: "traveler@example.com" },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                description: "회원가입 성공",
                content: apiResponse({
                  type: "object",
                  properties: {
                    accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiJ9..." },
                    tokenType: { type: "string", example: "Bearer" },
                    username: { type: "string", example: "traveler01" },
                    email: { type: "string", example: "traveler@example.com" },
                    role: { type: "string", example: "USER" },
                  },
                }),
              },
              409: {
                description: "이미 존재하는 username 또는 email",
                content: errorResponse("USERNAME_ALREADY_EXISTS", "이미 사용 중인 username입니다."),
              },
            },
          },
        },
        "/api/auth/login": {
          post: {
            tags: ["auth"],
            summary: "로그인",
            description: "username과 password로 로그인하고 JWT 토큰을 발급합니다.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["username", "password"],
                    properties: {
                      username: { type: "string", example: "traveler01" },
                      password: { type: "string", example: "password123" },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "로그인 성공",
                content: apiResponse({
                  type: "object",
                  properties: {
                    accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiJ9..." },
                    tokenType: { type: "string", example: "Bearer" },
                    username: { type: "string", example: "traveler01" },
                    email: { type: "string", example: "traveler@example.com" },
                    role: { type: "string", example: "USER" },
                  },
                }),
              },
              401: {
                description: "인증 실패",
                content: errorResponse("INVALID_CREDENTIALS", "username 또는 password가 올바르지 않습니다."),
              },
            },
          },
        },
        "/api/documents/health": {
          get: {
            tags: ["documents"],
            summary: "헬스체크",
            description: "API 서버 상태를 확인합니다.",
            responses: {
              200: {
                description: "정상",
                content: apiResponse({
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                }),
              },
            },
          },
        },
        "/api/documents": {
          get: {
            tags: ["documents"],
            summary: "문서 목록 조회",
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: "문서 목록",
                content: apiResponse({ type: "array", items: documentSchema }),
              },
              401: { description: "인증 필요", content: errorResponse("UNAUTHORIZED", "인증이 필요합니다.") },
            },
          },
          post: {
            tags: ["documents"],
            summary: "문서 생성",
            description: "여행 문서를 생성합니다. `embedding`을 함께 전달하면 벡터 검색에 활용됩니다.",
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["title", "content"],
                    properties: {
                      title: { type: "string", minLength: 1, maxLength: 255, example: "제주도 3박 4일 코스" },
                      content: { type: "string", minLength: 1, example: "1일차: 공항 → 성산일출봉..." },
                      embedding: {
                        type: "array",
                        items: { type: "number" },
                        nullable: true,
                        description: "1536차원 벡터 (선택)",
                        example: null,
                      },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                description: "생성된 문서",
                content: apiResponse(documentSchema),
              },
              401: { description: "인증 필요", content: errorResponse("UNAUTHORIZED", "인증이 필요합니다.") },
            },
          },
        },
        "/api/documents/search": {
          post: {
            tags: ["documents"],
            summary: "벡터 유사도 검색",
            description: "embedding 벡터로 유사한 문서를 검색합니다.",
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["embedding"],
                    properties: {
                      embedding: { type: "array", items: { type: "number" }, description: "1536차원 벡터" },
                      limit: { type: "integer", minimum: 1, maximum: 20, default: 10, example: 5 },
                      threshold: { type: "number", minimum: 0, maximum: 1, example: 0.5 },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "유사도 검색 결과",
                content: apiResponse({ type: "array", items: documentSchema }),
              },
              401: { description: "인증 필요", content: errorResponse("UNAUTHORIZED", "인증이 필요합니다.") },
            },
          },
        },
        "/api/documents/{id}": {
          get: {
            tags: ["documents"],
            summary: "문서 단건 조회",
            security: [{ bearerAuth: [] }],
            parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "1" } }],
            responses: {
              200: { description: "문서 상세", content: apiResponse(documentSchema) },
              401: { description: "인증 필요", content: errorResponse("UNAUTHORIZED", "인증이 필요합니다.") },
              404: { description: "문서 없음", content: errorResponse("DOCUMENT_NOT_FOUND", "문서를 찾을 수 없습니다.") },
            },
          },
          put: {
            tags: ["documents"],
            summary: "문서 수정",
            security: [{ bearerAuth: [] }],
            parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "1" } }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["title", "content"],
                    properties: {
                      title: { type: "string", minLength: 1, maxLength: 255, example: "수정된 제목" },
                      content: { type: "string", minLength: 1, example: "수정된 내용" },
                      embedding: { type: "array", items: { type: "number" }, nullable: true },
                    },
                  },
                },
              },
            },
            responses: {
              200: { description: "수정된 문서", content: apiResponse(documentSchema) },
              401: { description: "인증 필요", content: errorResponse("UNAUTHORIZED", "인증이 필요합니다.") },
              404: { description: "문서 없음", content: errorResponse("DOCUMENT_NOT_FOUND", "문서를 찾을 수 없습니다.") },
            },
          },
          delete: {
            tags: ["documents"],
            summary: "문서 삭제",
            security: [{ bearerAuth: [] }],
            parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "1" } }],
            responses: {
              200: { description: "삭제 완료", content: apiResponse({ type: "null", example: null }) },
              401: { description: "인증 필요", content: errorResponse("UNAUTHORIZED", "인증이 필요합니다.") },
              404: { description: "문서 없음", content: errorResponse("DOCUMENT_NOT_FOUND", "문서를 찾을 수 없습니다.") },
            },
          },
        },
        "/api/recommend": {
          get: {
            tags: ["recommend"],
            summary: "추천 서비스 헬스체크",
            responses: {
              200: {
                description: "정상",
                content: apiResponse({
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                }),
              },
            },
          },
          post: {
            tags: ["recommend"],
            summary: "AI 여행 추천",
            description: [
              "자연어 쿼리를 분석하여 관련 여행 문서를 추천합니다.",
              "",
              "1. 쿼리를 AI로 파싱하여 핵심 키워드 추출",
              "2. 쿼리를 embedding 벡터로 변환",
              "3. DB에서 유사도 기반 문서 검색",
              "4. 결과 반환",
            ].join("\n"),
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["query"],
                    properties: {
                      query: { type: "string", minLength: 1, maxLength: 500, example: "제주도 혼자 여행 3박 4일 추천해줘" },
                      topK: { type: "integer", minimum: 1, maximum: 20, default: 5, example: 5 },
                      threshold: { type: "number", minimum: 0, maximum: 1, default: 0.5, example: 0.5 },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "AI 추천 결과",
                content: apiResponse({
                  type: "object",
                  properties: {
                    originalQuery: { type: "string", example: "제주도 혼자 여행 3박 4일 추천해줘" },
                    refinedQuery: { type: "string", example: "제주도 솔로 여행 3박 4일 일정" },
                    keywords: { type: "array", items: { type: "string" }, example: ["제주도", "솔로여행", "3박4일"] },
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "1" },
                          title: { type: "string", example: "제주도 혼자 여행 완벽 가이드" },
                          content: { type: "string", example: "..." },
                          similarity: { type: "number", example: 0.87 },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                    totalCount: { type: "integer", example: 3 },
                  },
                }),
              },
            },
          },
        },
      },
    };
    res.json(spec);
  }
}
