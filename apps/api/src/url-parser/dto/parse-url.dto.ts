import { z } from "zod";

export const ParseUrlSchema = z.object({
  url: z.string().url("유효한 URL을 입력하세요"),
});

export type ParseUrlDto = z.infer<typeof ParseUrlSchema>;
