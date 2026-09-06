/*
  Warnings:

  - You are about to drop the column `profile_image` on the `doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "profile_image";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image" VARCHAR(500);
