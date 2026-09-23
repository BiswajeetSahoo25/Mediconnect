import medicine1 from "../../assets/images/medicines/medicine-1.svg?url";
import medicine2 from "../../assets/images/medicines/medicine-2.svg?url";
import medicine3 from "../../assets/images/medicines/medicine-3.svg?url";
import medicine4 from "../../assets/images/medicines/medicine-4.svg?url";
import medicine5 from "../../assets/images/medicines/medicine-5.svg?url";
import medicine6 from "../../assets/images/medicines/medicine-6.svg?url";

const MEDICINE_IMAGES = [
  medicine1,
  medicine2,
  medicine3,
  medicine4,
  medicine5,
  medicine6,
];

/**
 * Selects a consistent generic medicine image based on the medicine name.
 * Uses a hash of the medicine name to pick an image, so the same medicine
 * always gets the same generic illustration across pages.
 */
export function getMedicineImage(medicineName?: string | null): string {
  if (!medicineName) {
    return medicine1;
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
