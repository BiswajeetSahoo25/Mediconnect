ALTER TABLE "medical_documents"
  ALTER COLUMN "appointment_id" DROP NOT NULL,
  ADD COLUMN "file_data" BYTEA;
