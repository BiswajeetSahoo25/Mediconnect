-- AlterTable
ALTER TABLE "patient_emergency_contacts" ALTER COLUMN "contact_name" DROP NOT NULL,
ALTER COLUMN "contact_phone" DROP NOT NULL,
ALTER COLUMN "contact_relationship" DROP NOT NULL;
