/*
  Warnings:

  - You are about to drop the column `end_time` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `slot_duration_minutes` on the `doctor_availability` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[doctor_facility_id,appointment_date,queue_number]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[doctor_facility_id,day_of_week,start_time,end_time]` on the table `doctor_availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointment_model` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queue_number` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppointmentModel" AS ENUM ('IN_PERSON', 'VIDEO_CALL', 'PHONE_CALL');

-- DropIndex
DROP INDEX "appointments_doctor_facility_id_appointment_date_start_time_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "appointment_model" "AppointmentModel" NOT NULL,
ADD COLUMN     "queue_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "doctor_availability" DROP COLUMN "slot_duration_minutes";

-- AlterTable
ALTER TABLE "doctor_facilities" ADD COLUMN     "online_booking_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "online_booking_limit" INTEGER;

-- CreateTable
CREATE TABLE "appointment_daily_counters" (
    "id" UUID NOT NULL,
    "doctor_facility_id" UUID NOT NULL,
    "appointment_date" DATE NOT NULL,
    "last_queue_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_daily_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_daily_counters_doctor_facility_id_appointment_d_key" ON "appointment_daily_counters"("doctor_facility_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_doctor_facility_id_appointment_date_status_idx" ON "appointments"("doctor_facility_id", "appointment_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctor_facility_id_appointment_date_queue_numb_key" ON "appointments"("doctor_facility_id", "appointment_date", "queue_number");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_availability_doctor_facility_id_day_of_week_start_ti_key" ON "doctor_availability"("doctor_facility_id", "day_of_week", "start_time", "end_time");

-- AddForeignKey
ALTER TABLE "appointment_daily_counters" ADD CONSTRAINT "appointment_daily_counters_doctor_facility_id_fkey" FOREIGN KEY ("doctor_facility_id") REFERENCES "doctor_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
