import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { vectorToString, adjustVectorDimension, VECTOR_DIM } from "@reel-trip/utils";

type DocumentRow = {
  id: bigint;
  title: string;
  content: string;
  embedding: string | null;
  created_at: Date;
  updated_at: Date | null;
};

type SearchDocumentRow = DocumentRow & { similarity: string };

function mapRow(row: DocumentRow) {
  const cleaned = row.embedding?.replace("[", "").replace("]", "").trim() ?? "";
  const embedding =
    cleaned.length > 0 ? cleaned.split(",").map((v) => Number(v)) : null;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    embedding,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    content: string;
    embedding: number[] | null;
  }) {
    const vector = vectorToString(
      adjustVectorDimension(data.embedding, VECTOR_DIM)
    );
    const result = (await this.prisma.$queryRawUnsafe(
      `INSERT INTO documents (title, content, embedding, created_at)
       VALUES ($1, $2, $3::vector, now()) RETURNING id`,
      data.title,
      data.content,
      vector
    )) as Array<{ id: bigint }>;
    return result[0]!.id;
  }

  async findById(id: bigint) {
    const rows = (await this.prisma.$queryRawUnsafe(
      `SELECT id, title, content, embedding::text, created_at, updated_at
       FROM documents WHERE id = $1`,
      id
    )) as DocumentRow[];
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findAll() {
    const rows = (await this.prisma.$queryRawUnsafe(
      `SELECT id, title, content, embedding::text, created_at, updated_at
       FROM documents ORDER BY created_at DESC`
    )) as DocumentRow[];
    return rows.map(mapRow);
  }

  async update(
    id: bigint,
    data: { title: string; content: string; embedding: number[] | null }
  ) {
    const vector = vectorToString(
      adjustVectorDimension(data.embedding, VECTOR_DIM)
    );
    return this.prisma.$executeRawUnsafe(
      `UPDATE documents SET title=$1, content=$2, embedding=$3::vector, updated_at=now() WHERE id=$4`,
      data.title,
      data.content,
      vector,
      id
    );
  }

  async delete(id: bigint) {
    return this.prisma.$executeRawUnsafe(
      `DELETE FROM documents WHERE id=$1`,
      id
    );
  }

  async searchByVector(
    embedding: number[],
    limit: number,
    threshold?: number
  ) {
    const vector = vectorToString(
      adjustVectorDimension(embedding, VECTOR_DIM)
    );
    const query =
      threshold !== undefined
        ? `SELECT id, title, content, embedding::text, created_at, updated_at,
             ROUND(CAST(1 - (embedding <=> $1::vector) AS NUMERIC), 4) AS similarity
           FROM documents WHERE embedding IS NOT NULL
             AND (1 - (embedding <=> $1::vector)) >= $2
           ORDER BY embedding <=> $1::vector LIMIT $3`
        : `SELECT id, title, content, embedding::text, created_at, updated_at,
             ROUND(CAST(1 - (embedding <=> $1::vector) AS NUMERIC), 4) AS similarity
           FROM documents WHERE embedding IS NOT NULL
           ORDER BY embedding <=> $1::vector LIMIT $2`;

    const rows =
      threshold !== undefined
        ? ((await this.prisma.$queryRawUnsafe(
            query,
            vector,
            threshold,
            limit
          )) as SearchDocumentRow[])
        : ((await this.prisma.$queryRawUnsafe(
            query,
            vector,
            limit
          )) as SearchDocumentRow[]);

    return rows.map((row) => ({
      ...mapRow(row),
      similarity: parseFloat(row.similarity),
    }));
  }
}
