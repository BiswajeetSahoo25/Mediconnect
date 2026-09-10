import argon2 from "argon2";
import {
  ArticleStatus,
  UserRole,
} from "../../../src/generated/prisma/client.js";
import { prisma } from "../../../src/config/prisma.js";
import { articles } from "./article-data.js";

async function seedArticles() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required",
    );
  }

  const passwordHash = await argon2.hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });

  for (const article of articles) {
    await prisma.article.upsert({
      where: {
        slug: article.slug,
      },
      update: {
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        imageUrl: article.imageUrl,
        thumbnailUrl: article.thumbnailUrl,
        seoDescription: article.seoDescription,
        status: ArticleStatus.PUBLISHED,
        authorId: admin.id,
      },
      create: {
        ...article,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: admin.id,
      },
    });
  }

  console.log(`Seeded ${articles.length} articles.`);
}

seedArticles()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
