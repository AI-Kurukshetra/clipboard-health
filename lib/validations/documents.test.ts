import { describe, expect, it } from "vitest";

import { DocumentRecordSchema, UploadUrlSchema } from "@/lib/validations/documents";

describe("documents validation", () => {
  it("accepts signed upload request", () => {
    const result = UploadUrlSchema.safeParse({
      file_name: "license.pdf",
      document_kind: "license",
    });

    expect(result.success).toBe(true);
  });

  it("accepts document record", () => {
    const result = DocumentRecordSchema.safeParse({
      document_kind: "certification",
      document_type: "BLS",
      storage_path: "worker-documents/user-1/certification/file.pdf",
    });

    expect(result.success).toBe(true);
  });
});
