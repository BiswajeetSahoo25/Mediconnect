-- Preserve existing date-only appointments without inventing a start time.
ALTER TABLE "appointments"
ADD COLUMN "appointment_start_at" TIMESTAMPTZ(3);

-- One active appointment may occupy a doctor-facility start instant.
-- Cancelled and legacy date-only appointments do not reserve a timed slot.
CREATE UNIQUE INDEX "appointments_active_doctor_facility_start_at_key"
ON "appointments" ("doctor_facility_id", "appointment_start_at")
WHERE "appointment_start_at" IS NOT NULL AND "status" = 'SCHEDULED';
