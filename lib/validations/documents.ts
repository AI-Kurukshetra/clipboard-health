import { z } from "zod";

export const DocumentKindSchema = z.enum(["license", "certification"]);

export const UploadUrlSchema = z.object({
  file_name: z.string().min(1).max(255),
  document_kind: DocumentKindSchema,
});

export const DocumentRecordSchema = z.object({
  document_kind: DocumentKindSchema,
  document_type: z.string().min(1).max(120),
  storage_path: z.string().min(1).max(500),
  issue_date: z.string().date().optional(),
  expiry_date: z.string().date().optional(),
  identifier: z.string().max(120).optional(),
  issuer: z.string().max(120).optional(),
});

export type UploadUrlInput = z.infer<typeof UploadUrlSchema>;
export type DocumentRecordInput = z.infer<typeof DocumentRecordSchema>;
