-- DropForeignKey
ALTER TABLE "doctor_leave" DROP CONSTRAINT "doctor_leave_doctor_facility_id_fkey";

-- AlterTable
ALTER TABLE "doctor_leave" ALTER COLUMN "doctor_facility_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "doctor_leave" ADD CONSTRAINT "doctor_leave_doctor_facility_id_fkey" FOREIGN KEY ("doctor_facility_id") REFERENCES "doctor_facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
