import { Prisma } from "../generated/prisma/client.js";

import { PatientRepository } from "../repositories/patient.repository.js";
import { PatientEmergencyContactRepository } from "../repositories/patient-emergency-contact.repository.js";

import type {
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
} from "../validators/patient-emergency-contact.validator.js";

import {
  NotFoundError,
  BadRequestError,
} from "../errors/http-errors.js";

export class PatientEmergencyContactService {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly emergencyContactRepository: PatientEmergencyContactRepository,
  ) {}

  async getContacts(userId: string) {
    const patient = await this.patientRepository.findByUserId(userId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    return this.emergencyContactRepository.findByPatientId(patient.id);
  }

  async createContact(
    userId: string,
    data: CreateEmergencyContactInput,
  ) {
    const patient = await this.patientRepository.findByUserId(userId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const contactCount =
      await this.emergencyContactRepository.countByPatientId(
        patient.id,
      );

    if (contactCount >= 3) {
      throw new BadRequestError(
        "Maximum 3 emergency contacts are allowed",
      );
    }

    const isPrimary = data.isPrimary ?? contactCount === 0;

    if (isPrimary) {
      const existingContacts =
        await this.emergencyContactRepository.findByPatientId(
          patient.id,
        );

      for (const contact of existingContacts) {
        if (contact.isPrimary) {
          await this.emergencyContactRepository.update(
            contact.id,
            {
              isPrimary: false,
            },
          );
        }
      }
    }

    const createData: Prisma.PatientEmergencyContactCreateInput = {
      patient: {
        connect: {
          id: patient.id,
        },
      },
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactRelationship: data.contactRelationship,
      isPrimary,
    };

    return this.emergencyContactRepository.create(createData);
  }

  async updateContact(
    userId: string,
    contactId: string,
    data: UpdateEmergencyContactInput,
  ) {
    const patient = await this.patientRepository.findByUserId(userId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const contact =
      await this.emergencyContactRepository.findById(contactId);

    if (!contact || contact.patientId !== patient.id) {
      throw new NotFoundError("Emergency contact not found");
    }

    if (data.isPrimary === true) {
      const existingContacts =
        await this.emergencyContactRepository.findByPatientId(
          patient.id,
        );

      for (const existingContact of existingContacts) {
        if (
          existingContact.id !== contactId &&
          existingContact.isPrimary
        ) {
          await this.emergencyContactRepository.update(
            existingContact.id,
            {
              isPrimary: false,
            },
          );
        }
      }
    }

    const updateData: Prisma.PatientEmergencyContactUpdateInput = {
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactRelationship: data.contactRelationship,
      isPrimary: data.isPrimary,
    };

    return this.emergencyContactRepository.update(
      contactId,
      updateData,
    );
  }

  async deleteContact(
    userId: string,
    contactId: string,
  ) {
    const patient = await this.patientRepository.findByUserId(userId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const contact =
      await this.emergencyContactRepository.findById(contactId);

    if (!contact || contact.patientId !== patient.id) {
      throw new NotFoundError("Emergency contact not found");
    }

    return this.emergencyContactRepository.delete(contactId);
  }
}