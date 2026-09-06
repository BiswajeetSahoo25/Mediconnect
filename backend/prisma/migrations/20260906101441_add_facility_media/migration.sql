/*
  Warnings:

  - You are about to drop the column `profile_image` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "profile_image";

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(1000) NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "media_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_media" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "media_type" VARCHAR(50) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_media" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "media_type" VARCHAR(50) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facilityAddressId" UUID,

    CONSTRAINT "facility_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_media_type_idx" ON "media"("media_type");

-- CreateIndex
CREATE INDEX "user_media_user_id_media_type_idx" ON "user_media"("user_id", "media_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_media_user_id_media_id_key" ON "user_media"("user_id", "media_id");

-- CreateIndex
CREATE INDEX "facility_media_facility_id_media_type_idx" ON "facility_media"("facility_id", "media_type");

-- CreateIndex
CREATE INDEX "facility_media_media_id_idx" ON "facility_media"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_media_facility_id_media_id_key" ON "facility_media"("facility_id", "media_id");

-- AddForeignKey
ALTER TABLE "user_media" ADD CONSTRAINT "user_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_media" ADD CONSTRAINT "user_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_media" ADD CONSTRAINT "facility_media_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "healthcare_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_media" ADD CONSTRAINT "facility_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_media" ADD CONSTRAINT "facility_media_facilityAddressId_fkey" FOREIGN KEY ("facilityAddressId") REFERENCES "facility_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
