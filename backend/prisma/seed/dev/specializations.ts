import { prisma } from "../../../src/config/prisma.js";
import { specializationCatalog } from "./specialization-data.js";

async function seedSpecializations() {
  for (const specialization of specializationCatalog) {
    await prisma.specialization.upsert({
      where: { name: specialization.name },
      update: {},
      create: specialization,
    });
  }

  console.log(`Specialization catalog ready: ${specializationCatalog.length} options.`);
}

seedSpecializations()
  .catch((error: unknown) => {
    console.error("Failed to seed specializations:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
