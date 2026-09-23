import * as medicine from "../../assets/images/medicines";

const MEDICINE_IMAGES = [
  medicine.medicine_1,
  medicine.medicine_2,
  medicine.medicine_3,
  medicine.medicine_4,
  medicine.medicine_5,
  medicine.medicine_6,
];

/**
 * Selects a consistent generic medicine image based on the medicine name.
 * Uses a hash of the medicine name to pick an image, so the same medicine
 * always gets the same generic illustration across pages.
 */
export function getMedicineImage(medicineName?: string | null): string {
  if (!medicineName) {
    return medicine.medicine_1;
  }

  const normalized = medicineName.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }

  const index = Math.abs(hash) % MEDICINE_IMAGES.length;
  return MEDICINE_IMAGES[index];
}

/**
 * Gets the image filename (without extension) for a medicine, used for alt text.
 */
export function getMedicineImageAlt(medicineName?: string | null): string {
  if (!medicineName) {
    return "Generic medicine illustration";
  }
  return `Generic illustration of ${medicineName}`;
}
